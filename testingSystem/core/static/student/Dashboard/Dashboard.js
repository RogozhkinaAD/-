class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            loadError: '',

            user: {},
            organization: "",
            className: "",
            newTasks: [],
            readyTasks: [],
        }
    }

    componentDidMount() {
        const { token } = this.props;
        fetch("/s/getList",
            {
                method: 'POST',
                // body: JSON.stringify({ token: token }),
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
            user, organization, className,
            newTasks, readyTasks
        } = this.state;

        const task_url = '/s/task/'
        return <div id="container">
            {!loaded && <Loader/>}
            {loaded && loadError.length > 0 &&
                <div className="error">{loadError}</div>
            }
            {loaded && loadError.length === 0 &&
                <div className="student-wrapper">
                    <div className="student-name">
                        {user.last_name} {user.first_name} {user.second_name}
                    </div>
                    <div className="student-org">{organization}, класс: {className}</div>
                    <div className="sections">
                        <div className="new-tasks-wrapper">
                            <div className="section-title">Новые задания</div>
                            <div className="section-list">
                                {newTasks.map((task) => {
                                    return <div className="task-row new-task-row" key={"ntr-" + task.id}>
                                        <div>
                                            <div className="subject-name">{task.subject}</div>
                                            <div className="task-name">{task.name}</div>
                                            {task.timer > 0 &&
                                                <div className="timer">
                                                    Ограничение времени: <span>{Utils.formatSeconds(task.timer)}</span>
                                                </div>
                                            }
                                            {task.timer === 0 &&
                                                <div className="timer">
                                                    Без ограничения времени
                                                </div>
                                            }
                                        </div>
                                        <div>
                                            <a href={task_url + task.id} title="Начать">
                                                <img src="/static/images/start.svg"/>
                                            </a>
                                        </div>
                                    </div>
                                })}
                            </div>
                        </div>
                        <div className="ready-tasks-wrapper">
                            <div className="section-title">Решенные задания</div>
                            <div className="section-list">
                                {readyTasks.map((task) => {
                                    const onCheck = task.check_by_teacher && task.grade === 0;
                                    return <div className="task-row ready-task-row" key={"ntr-" + task.id}>
                                        <div>
                                            <div className="subject-name">{task.subject}</div>
                                            <div className="task-name">{task.name}</div>
                                            <div className="task-result">
                                                {task.date}&nbsp;&nbsp;Результат:&nbsp;
                                                {onCheck && <span>На проверке</span>}
                                                {!onCheck &&
                                                    <span className={"color-" + task.grade}>{task.percent}%</span>
                                                }
                                            </div>
                                        </div>
                                        <div className={"task-grade color-" + task.grade}>
                                            {onCheck && "Х"}
                                            {!onCheck && task.grade}
                                        </div>
                                    </div>
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    }
}
