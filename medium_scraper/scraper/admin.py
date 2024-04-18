from django.contrib import admin
from .models import BlogPost
import csv
from django.http import HttpResponse


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('creator', 'title', 'content', 'tags', 'responses')
    search_fields = ['creator', 'title', 'tags']
    actions = ['export_to_csv']
    list_per_page = 20

    def export_to_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="blog_posts.csv"'
        writer = csv.writer(response)
        writer.writerow(['Creator', 'Title', 'Content', 'Tags', 'Responses'])
        for post in queryset:
            writer.writerow([post.creator, post.title, post.content, post.tags, post.responses])
        return response
    export_to_csv.short_description = "Export selected blog posts to CSV"
