# app/db/base.py

from app.db.session import engine, Base

from app.db.models import *

Base.metadata.create_all(bind=engine)