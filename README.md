## Система тестирования для образовательных платформ

**Запуск:**
1. `cd to project directory`
2. `source .venv/bin/activate`
3. `cd django/testingSystem`
4. `python3 manage.py runserver`
5. Open http://127.0.0.1:8000/ in browser

Links:

https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/

https://www.djangoproject.com/start/

https://www.svgrepo.com/collection/multimedia-collection/

https://docs.djangoproject.com/en/5.1/ref/contrib/auth/ - User model


Новое приложение:   
- `python manage.py startapp AppName` - linux  
- `py manage.py startapp AppName` - windows

https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Models

https://docs.djangoproject.com/en/5.1/topics/db/models/

https://docs.djangoproject.com/en/5.1/topics/db/queries/

```
python manage.py showmigrations
python manage.py makemigrations
python manage.py migrate
```