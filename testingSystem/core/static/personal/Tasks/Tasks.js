class Tasks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            filter: '',
            tasks: [],
            personal: [],
            subjects: [],
            classes: [],
            inProductionFormsOpen: [],
        }

        this.loadData = this.loadData.bind(this);
        this.changeFilter = this.changeFilter.bind(this);

        this.delete = this.delete.bind(this);
        this.restore = this.restore.bind(this);

        this.taskToProduction = this.taskToProduction.bind(this);
        this.saveInProduction = this.saveInProduction.bind(this);
    }

    componentDidMount() {
        this.loadData()
    }
    loadData() {
        const { token } = this.props;
        fetch("/personal/tasks/list",
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

    changeFilter(e) {
        this.setState({ filter: e.target.value });
    }

    delete(task) {
        if (!confirm("Удалить " + task.name + "?")) {
            return;
        }
        const { token } = this.props;
        const { tasks } = this.state;
        fetch("/personal/task/delete",
            {
                method: 'POST',
                body: JSON.stringify({ id: task.id }),
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
                        let newTasks = tasks.map((t) => {
                            if (t.id === task.id) {
                                t.deleted = true;
                            }
                            return t;
                        });

                        this.setState({ tasks: [ ...newTasks ] });
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }
    restore(task) {
        if (!confirm("Востановить " + task.name + "?")) {
            return;
        }
        const { token } = this.props;
        const { tasks } = this.state;
        fetch("/personal/task/restore",
            {
                method: 'POST',
                body: JSON.stringify({ id: task.id }),
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
                        let newTasks = tasks.map((t) => {
                            if (t.id === task.id) {
                                t.deleted = false;
                            }
                            return t;
                        });

                        this.setState({ tasks: [ ...newTasks ] });
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }

    taskToProduction(id, cl) {
        const { tasks } = this.state;

        const newTasks = tasks.map((t) => {
            if (t.id !== id) {
                return t;
            }
            if (t.classes.indexOf(cl) === -1) {
                t.classes.push(cl);
            } else {
                t.classes = t.classes.filter((c) => c.id !== cl.id)
            }
            this.setState({ tasks: [ ...tasks ]});
        })


    }
    saveInProduction(id) {
        const { tasks, inProductionFormsOpen } = this.state;
        const { token } = this.props;
        let task = null;
        for (let i in tasks) {
            if (tasks[i].id === id) {
                task = tasks[i];
                break;
            }
        }
        if (task === null) {
            return null;
        }
        fetch("/personal/task/saveInProduction",
            {
                method: 'POST',
                body: JSON.stringify({ id: task.id, classes: [ ...task.classes ] }),
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
                        let newTasks = tasks.map((t) => {
                            if (t.id === task.id) {
                                t.in_production = t.classes.length > 0
                            }
                            return t;
                        });

                        this.setState(
                            {
                                tasks: [ ...newTasks ],
                                inProductionFormsOpen: inProductionFormsOpen.filter((i) => i !== task.id)
                            }
                        );
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }

    render() {
        const { disabled, access } = this.props;
        const {
            loaded, filter,
            tasks, personal, subjects, classes,
            inProductionFormsOpen
        } = this.state;

        const s = {};
        subjects.map((subject) => {s[subject.id] = subject.name});
        const p = {};
        personal.map((person) => {p[person.id] = person.last_name + " " + person.first_name + " " + person.second_name});
        const find = filter.toLowerCase();

        return <div className="task-menu-wrapper">
            {!loaded && <Loader/>}
            {loaded &&
                <Search filter={filter} onChange={this.changeFilter}/>
            }
            {loaded &&
                <div className="taks-menu-container">
                    {!disabled &&
                        <div className="taks-menu-buttons">
                            <Button type="add" title="Добавить" onClick={() => {location.href="/personal/task/new";}}/>
                            <Button type="update" title="Обновить список" onClick={this.loadData}/>
                        </div>
                    }
                    <div className="table task-table">
                        <div className="table-row table-header">
                            <div className="table-ceil id">#</div>
                            <div className="table-ceil subject">Предмет</div>
                            <div className="table-ceil name">Название</div>
                            {access === 'admin' &&
                                <div className="table-ceil teacher">Преподаватель</div>
                            }
                            <div className="table-ceil in_production">Назначен</div>
                            {!disabled && access === 'teacher' &&
                                <div className="table-ceil actions"></div>
                            }
                        </div>
                        {tasks.filter((task) => find === '' || task.name.toLowerCase().indexOf(find) > -1).map(
                            (task) => {
                                const openInProduction = inProductionFormsOpen.indexOf(task.id) !== -1;
                                const taskClasses = task.classes.map((cl) => cl.id);
                                return <div key={"tmr-" + task.id}>
                                    <div
                                        className={
                                            "table-row" +
                                            " " +(task.deleted === 1 ? "deleted" : "") +
                                            " " +(openInProduction ? "in-prod" : "") +
                                            " " +(task.deleted === 0 && task.in_production && task.check_by_teacher ? "need-check" : "")
                                        }>
                                        <div className="table-ceil id">{task.id}</div>
                                        <div className="table-ceil subject">{s[task.subject_id]}</div>
                                        <div className="table-ceil name">{task.name}</div>
                                        {access === 'admin' &&
                                            <div className="table-ceil teacher">{p[task.author]}</div>
                                        }
                                        <div className="table-ceil in_production">
                                            {task.in_production &&
                                                <img src="/static/js/Checkbox/checked.svg"/>
                                            }
                                            {!task.in_production &&
                                                <img src="/static/js/Checkbox/unchecked.svg"/>
                                            }
                                        </div>
                                        {!disabled && access === 'teacher' &&
                                            <div className="table-ceil actions">
                                                {task.deleted === 1 && !task.in_production &&
                                                    <Button type="restore" title="Восстановить" onClick={() => {
                                                        this.restore(task);
                                                    }}/>
                                                }
                                                {task.deleted === 0 && !task.in_production &&
                                                    <Button type="edit" title="Изменить" onClick={() => {
                                                        location.href = "/personal/task/" + task.id;
                                                    }}/>
                                                }
                                                {task.deleted === 0 && !task.in_production &&
                                                    <Button type="delete" title="Удалить" onClick={() => {
                                                        this.delete(task);
                                                    }}/>
                                                }
                                                {task.deleted === 0 && !openInProduction &&
                                                    <Button type="settings" title="Назначить" onClick={() => {
                                                        inProductionFormsOpen.push(task.id);
                                                        this.setState({inProductionFormsOpen: [...inProductionFormsOpen]});
                                                    }}/>
                                                }
                                                {task.deleted === 0 && task.in_production &&
                                                    <Button type="result" title="Контроль результатов" onClick={() => {
                                                        location.href = "/personal/task/results/" + task.id;
                                                    }}/>
                                                }
                                            </div>
                                        }
                                    </div>
                                    {!disabled && !task.delete && openInProduction &&
                                        <div className="in-production-wrapper">
                                            <div className="ip-all-classes">
                                                <div className="ip-title">Классы все</div>
                                                <div className="ip-ac-list">
                                                    {classes.filter((cl) => taskClasses.indexOf(cl.id) === -1).map((cl) => <div
                                                        key={"ip-ac-" + cl.id}
                                                        onClick={() => {this.taskToProduction(task.id, cl)}}
                                                    >{cl.name}</div>)}
                                                </div>
                                            </div>
                                            <div className="ip-selected-classes">
                                                <div className="ip-title">Классы назначенные</div>
                                                <div className="ip-sc-list">
                                                    {task.classes.map((cl) => <div
                                                        key={"ip-ac-" + cl.id}
                                                        onClick={() => {this.taskToProduction(task.id, cl)}}
                                                    >{cl.name}</div>)}
                                                </div>
                                            </div>
                                            <div className="ip-buttons">
                                                <Button type="save" title="Сохранить" onClick={() => {
                                                    this.saveInProduction(task.id)
                                                }}/>
                                                <Button type="cancel" title="Отмена"  onClick={() => {
                                                    const n = inProductionFormsOpen.filter((i) => i !== task.id);
                                                    this.setState({inProductionFormsOpen: [ ...n ]});
                                                }}/>
                                            </div>
                                        </div>
                                    }
                                </div>;
                            }
                        )}
                    </div>
                </div>
            }
        </div>;
    }
}
