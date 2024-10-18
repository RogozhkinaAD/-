from core.tasks.TypesEnum import TypesEnum

class TaskSimpleSelect():
    def __init__(self, q):
        self.id = q['id']
        self.question = q['question']
        self.answers = q['answers']

    def prepareToComplete(self):
        return {
            'id': self.id,
            'type': TypesEnum.simpleSelect.value,
            'question': self.question,
            'answers': [{'id': a['id'], 'text': a['text']} for a in self.answers],
            'checkbox': sum([1 if a['correct'] else 0 for a in self.answers]) > 1
        }

    def checkResult(self, res):
        correct = []
        for a in self.answers:
            if a['correct']:
                correct.append(a['id'])

        res = [int(r) for r in res]
        res.sort()
        correct.sort()

        return 1 if res == correct else 0

    def prepareToShowResults(self, result):
        res = result['res'] if result is not None and 'res' in result else []
        q_correct = True
        answers = []
        for a in self.answers:
            a['student_check'] = str(a['id']) in res
            if a['student_check'] != a['correct']:
                q_correct = False
            answers.append(a)

        return {
            'id': self.id,
            'type': TypesEnum.simpleSelect.value,
            'question': self.question,
            'correct': q_correct,
            'answers': answers,
            'checkbox': sum([1 if a['correct'] else 0 for a in self.answers]) > 1
        }
