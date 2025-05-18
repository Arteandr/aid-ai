from datetime import datetime

import pytz
from pydantic import BaseModel, ConfigDict, conint
from pydantic.alias_generators import to_camel
from sqlalchemy import Column, DateTime, event
from sqlalchemy.ext.declarative import declarative_base

utc_zone = pytz.UTC
PrimaryKey = conint(gt=0, lt=2147483647)
Base = declarative_base()
metadata = Base.metadata


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
        serialization_by_alias=True,  # добавляем, чтобы по умолчанию сериализовать с alias
    )


class TimeStampMixin(object):
    created_at = Column(DateTime, default=lambda: datetime.now(utc_zone))
    created_at._creation_order = 9998
    updated_at = Column(DateTime, default=lambda: datetime.now(utc_zone))
    updated_at._creation_order = 9998

    @staticmethod
    def _updated_at(mapper, connection, target):
        target.updated_at = datetime.now(utc_zone)

    @classmethod
    def __declare_last__(cls):
        event.listen(cls, "before_update", cls._updated_at)
