class Student:
    pass


student = Student()
setattr(student, "name", "Maya")
print(getattr(student, "name"))
print(getattr(student, "grade", "Unknown"))
print(hasattr(student, "name"))
