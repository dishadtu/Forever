from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Profile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    videos: List['Video'] = Relationship(back_populates='profile')

class Video(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    source: str
    thumbnail: Optional[str] = None
    profile_id: Optional[int] = Field(default=None, foreign_key='profile.id')
    profile: Optional[Profile] = Relationship(back_populates='videos')
