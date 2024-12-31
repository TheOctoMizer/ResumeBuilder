from enum import Enum

class WorkArrangementType(str, Enum):
    FullTime = "Full-time"
    PartTime = "Part-time"
    Internship = "Internship"
    Contract = "Contract"
    NotSpecified = "Not Specified"