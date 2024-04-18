from django.contrib import admin
from django.urls import path
from scraper.views import crawl_tag_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('crawl/<str:tag>/', crawl_tag_page, name='crawl_tag_page'),
    
]


