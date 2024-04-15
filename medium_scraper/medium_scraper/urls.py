from django.contrib import admin
from django.urls import path
from scraper.views import crawl_tag_page, get_crawled_data

urlpatterns = [
    path('admin/', admin.site.urls),
    path('crawl/<str:tag>/', crawl_tag_page, name='crawl_tag_page'),
    path('api/crawled-data/', get_crawled_data, name='get_crawled_data'),
    
]


