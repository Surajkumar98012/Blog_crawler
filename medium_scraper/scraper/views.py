# views.py
import time
import unicodedata
from bs4 import BeautifulSoup
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from .models import BlogPost
from django.shortcuts import render
from django.http import JsonResponse

def save_to_database(data):
    for post in data:
        # Check if the blog post already exists in the database
        existing_post = BlogPost.objects.filter(
            creator=post['creator'],
            title=post['title'],
            content=post['content']
        ).first()

        if existing_post:
            # If the post already exists, update the existing record
            existing_post.tags = post['tags']
            existing_post.responses = post['responses']
            existing_post.save()
        else:
            # If the post doesn't exist, create a new record
            BlogPost.objects.create(
                creator=post['creator'],
                title=post['title'],
                content=post['content'],
                tags=post['tags'],
                responses=post['responses']
            )

def crawl_tag_page(request, tag, scroll_times=10):
    # Set up Chrome webdriver
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])

    driver = webdriver.Chrome(options=chrome_options)

    url = f"https://medium.com/tag/{tag}/recommended"
    driver.get(url)
    driver.implicitly_wait(5)
    time.sleep(0.5)

    html_content = driver.page_source

    # Extract initial data and save to the database
    extracted_data, unique_contents = extract_blog_data(html_content, tag)
    print(f"Extracted {len(extracted_data)} blog posts")

    save_to_database(extracted_data)

    # Prepare response data
    response_data = extracted_data

    # Continue scraping for additional data
    for _ in range(1, scroll_times):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        driver.implicitly_wait(5)
        time.sleep(0.5)

        html_content = driver.page_source

        new_data, unique_contents = extract_blog_data(html_content, tag, unique_contents)
        print(f"Extracted {len(new_data)} blog posts")

        save_to_database(new_data)

        # Append newly extracted data to response data
        response_data += new_data

    driver.quit()

    # Return the final response data as JSON response
    return JsonResponse(response_data, safe=False)

    # Return the crawled blog posts as JSON response
    blog_posts = BlogPost.objects.filter(tags__contains=tag).values()
    return JsonResponse(list(blog_posts), safe=False)

def extract_blog_data(html_content, tag, unique_contents=None):
    if unique_contents is None:
        unique_contents = set()

    soup = BeautifulSoup(html_content, 'html.parser')
    blog_posts = soup.find_all('div', class_='bg')

    blog_data = []

    for index, post in enumerate(blog_posts[2:], start=2):
        author_element = post.find('p', class_='be')
        creator = author_element.text.strip() if author_element else "Unknown Author"
        creator = remove_unicode_escape_sequences(creator)

        title_element = post.find('h2', class_='bj')
        title = title_element.text.strip() if title_element else "Untitled"
        title = remove_unicode_escape_sequences(title)

        description_element = post.find('h3', class_='z')
        content = description_element.text.strip() if description_element else "No Description Available"
        content = remove_unicode_escape_sequences(content)

        tags = tag

        comment_element = post.find('span', class_='pw-responses-count')
        responses = comment_element.text.strip() if comment_element else "No Comment Information Available"

        if creator == "Unknown Author":
            continue

        content_identifier = f"{creator}-{title}-{content}"

        if content_identifier in unique_contents:
            continue

        unique_contents.add(content_identifier)

        blog_post_data = {
            'creator': creator,
            'title': title,
            'content': content,
            'tags': tags,
            'responses': responses
        }

        blog_data.append(blog_post_data)

    return blog_data, unique_contents

def remove_unicode_escape_sequences(text):
    normalized_text = unicodedata.normalize("NFKD", text)
    return normalized_text.encode("ascii", "ignore").decode("utf-8")

def get_crawled_data(request):
    if request.method == 'GET':
        crawled_data = list(BlogPost.objects.all().values())  # Fetch all blog posts from the database
        return JsonResponse(crawled_data, safe=False)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def get_recommended_words(request):
    query = request.GET.get('query', '')
    if query:
        url = f'https://api.datamuse.com/sug?s={query}'
        try:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                words = [item['word'] for item in data]
                return JsonResponse(words, safe=False)
            else:
                # If the API request was not successful, return an empty list
                return JsonResponse([], safe=False)
        except Exception as e:
            # If an error occurs during the API request, log the error and return an empty list
            print(f"Error occurred during API request: {e}")
            return JsonResponse([], safe=False)
    else:
        # If no query parameter is provided, return an empty list
        return JsonResponse([], safe=False)