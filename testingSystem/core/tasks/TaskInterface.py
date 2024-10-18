from core.tasks.TypesEnum import TypesEnum
from core.tasks.TaskSimpleSelect import TaskSimpleSelect
from core.tasks.TaskSimpleAnswer import TaskSimpleAnswer
from core.models import OrganizationSubjects
from core.models import OrganizationStudents
from core.models import TaskToClasses
from core.models import TaskResults

class TaskInterface:
    subjects = {}
    grade_list = [5,4,3,2,1]

    # Подготовка результатов выполнения заданий для вывода ученику
    def toStudentList(self, task, task_result=None):
        result = {
            'id': task.id,
            'subject': self.__getSubjectName(task.subject_id),
            'name': task.name,
            'timer': task.timer,
        }

        if task_result is not None:
            result['percent'] = task_result.percent
            result['grade'] = task_result.grade
            result['date'] = task_result.datetime.strftime("%d.%m.%Y %H:%M:%S")
            result['check_by_teacher'] = task.check_by_teacher

        return result

    # Подготовка задания для вывода в интерфейс тестирования ученика
    def toStudentComplete(self, task):
        questions = []
        for q in task.content:
            if q['type'] == TypesEnum.simpleSelect.value:
                questions.append(TaskSimpleSelect(q).prepareToComplete())
            elif q['type'] == TypesEnum.simpleAnswer.value:
                questions.append(TaskSimpleAnswer(q).prepareToComplete())

        return {
            'subject': self.__getSubjectName(task.subject_id),
            'name': task.name,
            'description': task.description,
            'timer': task.timer,
            'hasTimer': task.timer > 0,
            'questions': questions
        }

    # Проверка ответов ученика
    def checkComplete(self, task, res):
        if task.check_by_teacher:
            return {
                'percent': 0,
                'grade': 0,
                'result_by_teacher': True
            }

        by_q = {}
        for r in res:
            if 'res' in r:
                by_q[r['q_id']] = r['res']

        checked = []
        for q in task.content:
            if q['type'] == TypesEnum.simpleSelect.value:
                checked.append(TaskSimpleSelect(q).checkResult(by_q[q['id']] if q['id'] in by_q else []))
            if q['type'] == TypesEnum.simpleAnswer.value:
                checked.append(TaskSimpleAnswer(q).checkResult(by_q[q['id']] if q['id'] in by_q else ''))

        all_q = len(checked)
        true_q = sum(checked)

        percent = round(true_q / all_q * 100, 2)

        grade = 1
        for i in self.grade_list:
            if percent >= int(task.criteria[str(i)]):
                grade = i
                break

        return {
            'percent': percent,
            'grade': grade,
            'result_by_teacher': False
        }

    # Проверка доступа ученика к заданию
    def checkStudentAccess(self, org_id, uid, task_id):
        cl_id = OrganizationStudents.objects.get(org_id=org_id, uid=uid).cl_id
        TaskToClasses.objects.get(class_id=cl_id, task_id=task_id)

    # Подготовка задания для вывода в интерфейс просмотра ответов учителем
    def toTeacherShowResult(self, task, task_result):
        questions = []
        for q in task.content:
            if q['type'] == TypesEnum.simpleSelect.value:
                results = list(filter(lambda a: a['q_id'] == q['id'] , task_result.answers))
                result = results[0] if len(results) > 0 else None
                questions.append(TaskSimpleSelect(q).prepareToShowResults(result))
            elif q['type'] == TypesEnum.simpleAnswer.value:
                results = list(filter(lambda a: a['q_id'] == q['id'] , task_result.answers))
                result = results[0] if len(results) > 0 else None
                questions.append(TaskSimpleAnswer(q).prepareToShowResults(result))

        return {
            'subject': self.__getSubjectName(task.subject_id),
            'name': task.name,
            'description': task.description,
            'questions': questions,
            'check_by_teacher': task.check_by_teacher
        }

    # Установка маркера задание должно быть проверено учителем
    def setCheckByTeacher(self, task):
        task.check_by_teacher = False
        for q in task.content:
            if q['type'] != TypesEnum.simpleAnswer.value:
                continue
            if TaskSimpleAnswer(q).getCheckByTeacher():
                task.check_by_teacher = True
                break
        return task

    # сохраняет результат проверки задания учителя
    def saveCheckByTeacher(self, task, uid, questions):
        results = TaskResults.objects.get(task_id=task.id, uid=uid)
        answers = results.answers

        # return { 'percent': 66.67, 'grade': 3 }

        for q in questions:
            if q['type'] != TypesEnum.simpleAnswer.value or not q['check_by_teacher']:
                continue
            for a in answers:
                if a['q_id'] == q['id']:
                    a['res'] = { 'answer': a['res'], 'correct': q['correct'] }
        results.answers = answers
        results.save()

        task.check_by_teacher = False
        return self.checkComplete(task, results.answers)

    def __getSubjectName(self, subject_id):
        if subject_id in self.subjects:
            return self.subjects[subject_id]

        subject = OrganizationSubjects.objects.get(id=subject_id)
        self.subjects[subject_id] = subject.name
        return subject.name
