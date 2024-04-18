import unicodedata
from bs4 import BeautifulSoup
import requests
from .models import BlogPost
from django.http import JsonResponse

def save_to_database(data):
    for post in data:
        creator = post['creator']
        title = post['title']
        content = post['content']

        existing_post = BlogPost.objects.filter(creator=creator, title=title, content=content).first()

        if existing_post:
            existing_post.responses = post['responses']
            existing_post.save()
        else:
            BlogPost.objects.create(**post)

def crawl_tag_page(request, tag):
    url = f"https://medium.com/tag/{tag}/recommended"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        html_content = response.content
    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': 'Failed to fetch data'}, status=500)

    extracted_data, unique_contents = extract_blog_data(html_content, tag)
    print(f"Extracted {len(extracted_data)} blog posts")

    save_to_database(extracted_data)
    return JsonResponse(extracted_data, safe=False)

def extract_blog_data(html_content, tag):
    soup = BeautifulSoup(html_content, 'html.parser')
    blog_posts = soup.find_all('div', class_='bg')

    blog_data = []
    unique_contents = set()

    for post in blog_posts[2:]:
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
        
        if creator == "Unknown Author" or title == "Untitled" or creator == "Recommended stories":
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
        crawled_data = list(BlogPost.objects.all().values())
        return JsonResponse(crawled_data, safe=False)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
