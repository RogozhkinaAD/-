from core.tasks.TypesEnum import TypesEnum

class TaskSimpleAnswer():
    def __init__(self, q):
        self.id = q['id']
        self.question = q['question']
        self.check_by_teacher = q['check_by_teacher']
        self.answers_variants = q['answers_variants']

    def getCheckByTeacher(self):
        return self.check_by_teacher

    def prepareToComplete(self):
        return {
            'id': self.id,
            'type': TypesEnum.simpleAnswer.value,
            'question': self.question,
        }

    def checkResult(self, answer):
        if self.check_by_teacher:
            return None if type(answer) is str else answer['correct']
        else:
            for a in self.answers_variants:
                if a.lower().strip() == answer.lower().strip():
                    return True
            return False

    def prepareToShowResults(self, result):
        res = result['res'] if result is not None and 'res' in result else ''
        q_correct = self.checkResult(res)

        return {
            'id': self.id,
            'type': TypesEnum.simpleAnswer.value,
            'question': self.question,
            'correct': q_correct,
            'student_answer': res if q_correct is None or not self.check_by_teacher else res['answer'],
            'check_by_teacher': self.check_by_teacher,
            'answers_variants': self.answers_variants,
        }
