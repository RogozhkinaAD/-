class Task extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            loadError: '',

            subject: '',
            name: '',
            description: '',
            timer: 0,
            interval: 0,
            questions: [],
            visibleQuestion: 0,
            completed: {},

            finish: false,
            percent: 0,
            grade: 0,
            result_by_teacher: false,
        }

        this.timer = this.timer.bind(this);
        this.toLeft = this.toLeft.bind(this);
        this.toRight = this.toRight.bind(this);
        this.toNum = this.toNum.bind(this);
        this.setComplete = this.setComplete.bind(this);
        this.ready = this.ready.bind(this);
    }

    componentDidMount() {
        const { token, id } = this.props;
        fetch("/s/task/" + id + "/get",
            {
                method: 'POST',
                body: JSON.stringify({ token: token }),
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
                        let interval = 0;
                        if (result.timer > 0) {
                            interval = setInterval(this.timer, 1000);
                        }
                        this.setState({ ...result, loaded: true, interval: interval });
                    } else {
                        this.setState({ loaded: true, loadError: "message" in result ? result.message : "Ошибка загрузки данных" });
                    }
                },
                (error) => {
                    this.setState({ loaded: true, loadError: "Ошибка запроса данных" });
                }
            );
    }

    timer() {
        const { timer, interval } = this.state;
        let t = timer - 1;

        if (t <= 0) {
            clearInterval(interval);
            this.ready();
            return;
        }
        this.setState({ timer: t });
    }

    toLeft() {
        const { questions, visibleQuestion } = this.state;
        this.toNum(visibleQuestion === 0 ? questions.length - 1 : visibleQuestion - 1);
    }
    toRight() {
        const { questions, visibleQuestion } = this.state;
        const l = questions.length - 1;
        this.toNum(visibleQuestion === l ? 0 : visibleQuestion + 1);
    }
    toNum(i) {
        const { visibleQuestion } = this.state;
        if (i === visibleQuestion) {
            return null;
        }
        this.setState({ visibleQuestion: i });
    }

    setComplete(i, values) {
        const { completed } = this.state;
        completed[i] = values;
        this.setState({ completed: { ...completed }});
    }

    ready() {
        const { token, id } = this.props;
        const { questions, completed } = this.state;

        const to_send = [];
        for (let i in questions) {
            let q_id = questions[i].id;
            let res = completed[i];
            to_send.push({q_id: q_id, res: res});
        }

        fetch("/s/task/" + id + "/complete",
            {
                method: 'POST',
                body: JSON.stringify({ result: [ ...to_send ] }),
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
                        this.setState({ ...result, finish: true });
                    } else {
                        this.setState({ loaded: true, loadError: "message" in result ? result.message : "Ошибка загрузки данных" });
                    }
                },
                (error) => {
                    this.setState({ loaded: true, loadError: "Ошибка запроса данных" });
                }
            );
    }

    render() {
        const {
            loaded, loadError,
            subject, name, description,
            questions, visibleQuestion, completed,
            timer, hasTimer,
            finish, percent, grade, result_by_teacher
        } = this.state;

        return <div id="container">
            {!loaded && <Loader/>}
            {loaded && loadError.length > 0 &&
                <div className="error-wrapper">{loadError}</div>
            }
            {loaded && loadError.length === 0 && finish && result_by_teacher &&
                <div className="test-result grade-6">
                    <div className="message">Завершено</div>
                    <div className="percent"><span>Ответы отправлены на проверку</span></div>
                    <div className="cloe">
                        <button onClick={() => {location.href="/";}}>Закрыть</button>
                    </div>
                </div>
            }
            {loaded && loadError.length === 0 && finish && !result_by_teacher &&
                <div className={"test-result grade-" + grade}>
                    <div className="message">Завершено</div>
                    <div className="percent">Результат: <span>{percent}%</span></div>
                    <div className="grade">Оценка: <span>{grade}</span></div>
                    <div className="cloe">
                        <button onClick={() => {location.href="/";}}>Закрыть</button>
                    </div>
                </div>
            }
            {loaded && loadError.length === 0 && !finish &&
                <div className="task-wrapper">
                    {hasTimer > 0 &&
                        <div className={"timer-wrapper" + (timer < 30 ? " dead-line" : "")}>{Utils.formatSeconds(timer)}</div>
                    }
                    <div className="title">
                        <span>{subject}.</span> {name}
                    </div>
                    <div className="description">{description}</div>
                    <div className="questions-wrapper">
                        <div className="q-to-left" onClick={this.toLeft}>
                            <img src="/static/student/Task/left.svg"/>
                        </div>
                        {questions.map((q, i) => {
                            switch (q.type) {
                                case 'simpleSelect':
                                    return <div className={"q-wrapper" + (visibleQuestion === i ? " visible" : "")} key={"q" + i}>
                                        <TaskSimpleSelect
                                            q={q}
                                            i={i}
                                            setComplete={(values) => {this.setComplete(i, values);}}
                                        />
                                    </div>;
                                case 'simpleAnswer':
                                    return <div className={"q-wrapper" + (visibleQuestion === i ? " visible" : "")} key={"q" + i}>
                                        <TaskSimpleAnswer
                                            q={q}
                                            i={i}
                                            setComplete={(values) => {this.setComplete(i, values);}}
                                        />
                                    </div>;
                            }
                        })}
                        <div className="q-to-right" onClick={this.toRight}>
                            <img src="/static/student/Task/right.svg"/>
                        </div>
                    </div>
                    {questions.length === Object.keys(completed).length &&
                        <div className="ready-btn-wrapper">
                            <button onClick={this.ready}>Завершить</button>
                        </div>
                    }
                    <div className="q-numbers">
                        {questions.map((q, i) => {
                            let cl = '';
                            if (visibleQuestion === i) {
                                cl = " selected";
                            } else if (typeof completed[i] !== "undefined") {
                                cl = " complete";
                            }
                            return <div
                                className={"q-switch-btn" + cl } key={"qb-" + i}
                                onClick={() => {this.toNum(i)}}
                            >{i + 1}</div>
                        })}
                    </div>
                </div>
            }
        </div>;
    }

}