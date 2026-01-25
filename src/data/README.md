# Local Project Data

Edit `projects.json` to add or update projects for local development.

Schema reference:

```
[
  {
    "id": "p-1001",
    "title": "Project title",
    "description": "Short description",
    "category": "community",
    "imageUrl": "https://example.com/cover.jpg",
    "galleryUrls": ["https://example.com/1.jpg", "https://example.com/2.jpg"],
    "goal": 12000,
    "currentAmount": 0,
    "donorCount": 0,
    "status": "active"
  }
]
```

Notes:
- Keep `id` values unique.
- `galleryUrls` can be an empty array.
- Clear the `cdh-projects` key in local storage to reload this file.
