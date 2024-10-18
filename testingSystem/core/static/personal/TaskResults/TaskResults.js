class TaskResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            filter: '',
            name: '',
            subject: '',
            classes: [],
            results: [],

            classSelected: 0
        }

        this.selectClass = this.selectClass.bind(this);
    }

    componentDidMount() {
        const { token, task_id } = this.props;
        fetch("/personal/task/results/" + task_id + "/get",
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

    selectClass(id) {
        this.setState({ classSelected: id });
    }

    render() {
        const { task_id } = this.props;
        const { loaded, name, subject, classes, classSelected, results } = this.state;

        const students = classSelected in results ? results[classSelected] : []

        return <div className="task-results-wrapper">
            {!loaded && <Loader/>}
            {loaded &&
                <div>
                    <div className="task-title"><span>Задание</span>: #{task_id} {name} ({subject})</div>
                    <div className="task-results-container">
                        <div className="classes-list">
                            <div className="trc-title">Классы</div>
                            {classes.map((c) => {
                                return <div
                                    className={"classes-row" + (c.id === classSelected ? " selected" : "")}
                                    key={"cr-"+c.id}
                                    onClick={() => {this.selectClass(c.id);}}
                                >{c.name}</div>
                            })}
                        </div>
                        <div className="classes-results">
                            <div className="trc-title">&nbsp;</div>
                            {classSelected > 0 &&
                                <div className="table results-table">
                                    <div className="table-row table-header">
                                        <div className="table-ceil name">ФИО</div>
                                        <div className="table-ceil percent">% выполнения</div>
                                        <div className="table-ceil grade">Оценка</div>
                                        <div className="table-ceil date">Дата</div>
                                        <div className="table-ceil actions"></div>
                                    </div>
                                    {students.map((st) => {
                                        return <div className="table-row" key={"crs-" + st.uid}>
                                            <div className="table-ceil name">{st.name}</div>
                                            {st.percent === -1 &&
                                                <div className="table-ceil colspan">Не выполнен</div>
                                            }
                                            {st.percent > -1 &&
                                                <div className={"table-ceil percent color-" + st.grade}>{st.percent}%</div>
                                            }
                                            {st.percent > -1 &&
                                                <div className={"table-ceil grade color-" + st.grade}>{st.grade}</div>
                                            }
                                            {st.percent > -1 &&
                                                <div className="table-ceil date">{st.datetime}</div>
                                            }
                                            {st.percent > -1 &&
                                                <div className="table-ceil actions in-body">
                                                    <Button
                                                        type="view"
                                                        title="Посмотреть ответы"
                                                        onClick={() => {
                                                            window.open("/personal/task/results/" + task_id + "/" + st.uid)
                                                        }}
                                                    />
                                                </div>
                                            }
                                        </div>;
                                    })}
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    }
}