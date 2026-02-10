from pydantic import BaseModel

class SliderCreate(BaseModel):
    title: str
    subtitle: str | None = None
    image_url: str
    button_text: str | None = None
    button_link: str | None = None

class SliderUpdate(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    image_url: str | None = None
    button_text: str | None = None
    button_link: str | None = None
    is_active: bool | None = None

class SliderOut(BaseModel):
    id: int
    title: str
    subtitle: str | None
    image_url: str
    button_text: str | None
    button_link: str | None
    is_active: bool

    class Config:
        from_attributes = True
