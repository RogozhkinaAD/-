class TaskResultView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            checked_in: false,
            task: {},
            student: '',
            className: '',
            percent: 0,
            grade: 0,
        }
        this.setCheckResult = this.setCheckResult.bind(this);
        this.calcGrade = this.calcGrade.bind(this);
        this.setGrade = this.setGrade.bind(this);
    }

    componentDidMount() {
        const { token, task_id, uid } = this.props;
        fetch("/personal/task/results/" + task_id + "/" + uid + "/get",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': token
                }
            }
        )
            .then(res => res.json())
            .then(
                (result) => {
                    if (result.status === "OK") {
                        this.setState({ ...result, loaded: true, checked_in: result.grade > 0 });
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }

    calcGrade() {
        const { token, task_id, uid } = this.props;
        const { task } = this.state;
        fetch("/personal/task/results/" + task_id + "/" + uid + "/calcGrade",
            {
                method: 'POST',
                body: JSON.stringify({ task: task }),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': token
                }
            }
        )
            .then(res => res.json())
            .then(
                (result) => {
                    if (result.status === "OK") {
                        this.setState({ ...result, loaded: true });
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }

    setGrade() {
        const { token, task_id, uid } = this.props;
        const { grade, percent } = this.state;
        fetch("/personal/task/results/" + task_id + "/" + uid + "/setGrade",
            {
                method: 'POST',
                body: JSON.stringify({ grade: grade, percent: percent }),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': token
                }
            }
        )
            .then(res => res.json())
            .then(
                (result) => {
                    if (result.status === "OK") {
                        this.setState({ ...result, checked_in: false });
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }

    setCheckResult(q_id, result) {
        const { task} = this.state;
        for (let i = 0; i < task.questions.length; i++) {
            if (task.questions[i].id !== q_id) {
                continue;
            }
            task.questions[i].correct = result;
            break;
        }
        this.setState({ task: { ...task } });
    }

    render() {
        const {
            loaded,
            task,
            student, className,
            percent, grade,
            checked_in
        } = this.state;


        return <div className="task-results-wrapper">
            {!loaded && <Loader/>}
            {loaded && task === {} &&
                <div className="error-wrapper">Ошибка загрузки данных</div>
            }
            {loaded && task !== {} &&
                <div>
                    <div className="student-info">
                        Ученик: <span>{student}</span>&nbsp;
                        Класс: <span>{className}</span>
                    </div>
                    <div className={"task-info color-" + grade}>
                        Оценка: <span>{grade}</span>&nbsp;(<span>{percent}%</span>)
                    </div>
                    <div className="task-info">
                        Задание: <span>{task.name}</span>&nbsp;
                        предмет: <span>{task.subject}</span>
                    </div>
                    <div className="task-description">{task.description}</div>
                    <div className="task-questions">
                        <div className="bold">Вопросы:</div>
                        {task.questions.map((q) => {
                            return <div key={"qr-" + q.id}>
                                {q.type === 'simpleSelect' && <SimpleSelectView q={q}/>}
                                {q.type === 'simpleAnswer' &&
                                    <SimpleAnswerView
                                        q={q}
                                        grade={grade}
                                        setCheckResult={(q_id, result) => {this.setCheckResult(q_id, result);}}
                                    />
                                }
                            </div>;
                        })}
                    </div>
                    {task.check_by_teacher && !checked_in &&
                        <div className="teacher-check-wrapper">
                            {grade === 0 &&
                                <button onClick={this.calcGrade}>Посчитать оценку</button>
                            }
                            {grade > 0 &&
                                <div>
                                    Оценка: <input value={grade} onChange={(e) => {this.setState({ grade: e.target.value })}}/>&nbsp;
                                    Результат: <input value={percent} onChange={(e) => {this.setState({ percent: e.target.value })}}/> %&nbsp;
                                    <button onClick={this.setGrade}>Выставить оценку</button>
                                </div>
                            }
                        </div>
                    }
                </div>
            }
        </div>
    }
}

class SimpleSelectView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { q } = this.props;
        return <div className={"question-row correct-" + (q.correct ? "true" : "false")}>
            <div className="q-question">{q.question}</div>
            <div className="table results-table">
                <div className="table-row table-header">
                    <div className="table-ceil student-res">Ответы</div>
                    <div className="table-ceil true-res">Верные</div>
                    <div className="table-ceil variant">Вариант ответа</div>
                </div>
            </div>
            {q.answers.map((a) => {
                const stud_src = (a.student_check ? "" : "un") + "checked." + (a.student_check === a.correct ? "true" : "false") + ".svg";
                const correct_src = (a.correct ? "" : "un") + "checked.svg";
                return <div className="a-row table-row" key={"ar-" + a.id}>
                    <div className="table-ceil true-res">
                        <img src={"/static/personal/TaskResultView/" + stud_src}/>
                    </div>
                    <div className="table-ceil student-res">
                        <img src={"/static/personal/TaskResultView/" + correct_src}/>
                    </div>
                    <div className="table-ceil variant">{a.text}</div>
                </div>
            })}
        </div>;
    }
}
class SimpleAnswerView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { q, grade, setCheckResult } = this.props;

        let correct = "none";
        if (!q.check_by_teacher) {
            correct = q.correct ? "true" : "false";
        } else if (q.correct !== null) {
            correct = q.correct ? "true" : "false";
        }

        const answer = typeof q.student_answer === 'string' ? q.student_answer : q.student_answer.answer;

        return <div className={"question-row correct-" + correct}>
            <div className="q-question">{q.question}</div>
            <div className={"q-student-answer correct-" + correct}>Ответ ученика: <b>{answer}</b></div>
            {!q.check_by_teacher &&
                <div className="q-variants-answer">Варинты ответов: {q.answers_variants.join(", ")}</div>
            }
            {q.check_by_teacher && grade === 0 &&
                <div className="teacher-check-block">
                    <Button type="result-true" title="Ответ верный" onClick={() => {setCheckResult(q.id, true);}}/>
                    <Button type="result-false" title="Ответ не верный" onClick={() => {setCheckResult(q.id, false);}}/>
                </div>
            }
            {q.check_by_teacher && grade > 0 &&
                <div>Проверено</div>
            }
        </div>;
    }
}