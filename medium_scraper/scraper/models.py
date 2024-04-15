from django.db import models

class BlogPost(models.Model):
    creator = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    content = models.TextField()
    tags = models.CharField(max_length=255)
    responses = models.CharField(max_length=255)

    def __str__(self):
        return self.title
