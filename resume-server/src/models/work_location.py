from enum import Enum

class WorkLocationType(str, Enum):
    Onsite = "Onsite"
    Remote = "Remote"
    Hybrid = "Hybrid"
    NotSpecified = "Not Specified"