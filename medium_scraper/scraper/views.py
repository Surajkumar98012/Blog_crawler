import unicodedata
from bs4 import BeautifulSoup
import requests
from .models import BlogPost
from django.http import JsonResponse


def save_to_database(data):
    for post in data:
        creator = post["creator"]
        title = post["title"]
        content = post["content"]

        existing_post = BlogPost.objects.filter(
            creator=creator, title=title, content=content
        ).first()

        if existing_post:
            existing_post.responses = post["responses"]
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
        return JsonResponse({"error": "Failed to fetch data"}, status=500)

    extracted_data, unique_contents = extract_blog_data(html_content, tag)
    print(f"Extracted {len(extracted_data)} blog posts")

    save_to_database(extracted_data)
    return JsonResponse(extracted_data, safe=False)


def extract_blog_data(html_content, tag):
    soup = BeautifulSoup(html_content, "html.parser")
    blog_posts = soup.select("div.bg")  # Use a more specific selector

    blog_data = []
    unique_contents = set()

    for post in blog_posts:
        author_element = post.select_one("p.be")
        title_element = post.select_one("h2.bj")
        description_element = post.select_one("h3.z")
        comment_element = post.select_one("span.pw-responses-count")

        if not author_element or not title_element or not description_element:
            continue

        creator = remove_unicode(author_element.text.strip())
        title = remove_unicode(title_element.text.strip())
        content = remove_unicode(description_element.text.strip())
        responses = (
            comment_element.text.strip()
            if comment_element
            else "No Comment Information Available"
        )

        if creator == "Unknown Author" or title == "Untitled" or creator == "Help":
            continue

        content_identifier = f"{creator}-{title}-{content}"

        if content_identifier in unique_contents:
            continue

        unique_contents.add(content_identifier)

        blog_post_data = {
            "creator": creator,
            "title": title,
            "content": content,
            "tags": tag,
            "responses": responses,
        }

        blog_data.append(blog_post_data)

    return blog_data, unique_contents


def remove_unicode(text):
    normalized_text = unicodedata.normalize("NFKD", text)
    return normalized_text.encode("ascii", "ignore").decode("utf-8")
