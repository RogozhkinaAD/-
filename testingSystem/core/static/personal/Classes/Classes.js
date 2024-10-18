class Classes extends React.Component {
    defaultForm = {
        id: null,
        name: '',
    }
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            showForm: false,
            editForm: { ...this.defaultForm },

            filter: '',

            list: [],
        }

        this.changeFilter = this.changeFilter.bind(this);
        this.switchForm = this.switchForm.bind(this);
        this.changeName = this.changeName.bind(this);
        this.cancelForm = this.cancelForm.bind(this);
        this.edit = this.edit.bind(this);
        this.saveForm = this.saveForm.bind(this);
    }

    componentDidMount() {
        const { token } = this.props;
        fetch("/personal/classes/list",
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
                        this.setState({ loaded: true, loadError: "message" in result ? result.message : "Ошибка загрузки данных" });
                    }
                },
                (error) => {
                    this.setState({ loaded: true, loadError: "Ошибка запроса данных" });
                }
            );
    }

    changeFilter(e) {
        this.setState({ filter: e.target.value });
    }

    switchForm() {
        const { showForm} = this.state;
        this.setState({ showForm: !showForm });
    }
    changeName(e) {
        const { editForm } = this.state;
        editForm.name = e.target.value;
        this.setState({ editForm });
    }
    cancelForm() {
        this.setState({ editForm: { ...this.defaultForm }, showForm: false });
    }
    edit(org) {
        this.setState(
            {
                editForm: {
                    id: org.id,
                    name: org.name,
                },
                showForm: true
            }
        );
    }

    saveForm() {
        const { token, id, callUpdate } = this.props;
        const { editForm, list } = this.state;
        fetch("/personal/classes/edit",
            {
                method: 'POST',
                body: JSON.stringify({ ...editForm, org_id: id }),
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
                        let pers = [ ...list ]
                        if (editForm.id === null) {
                            pers.push({ ...result.data });
                        } else {
                            pers = pers.map((c) => {
                                if (c.id === editForm.id) {
                                    c = { ...result.data };
                                }
                                return c;
                            });
                        }

                        this.setState({ list: [ ...pers ], editForm: { ...this.defaultForm }, showForm: false });
                        callUpdate(pers);
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
        const { loaded, showForm, list, editForm, filter } = this.state;
        const { disabled } = this.props;

        const find = filter.toLowerCase();

        return <div className="table classes">
            {!loaded && <Loader/>}
            {loaded && !disabled &&
                <div>
                    <Button type="add" title="Добавить" onClick={this.switchForm}/>
                    <div className="adm-form org-form" style={showForm ? {} : {display: "none"}}>
                        {editForm.id !== null &&
                            <div className="adm-form-ceil org-form-ceil">
                                <div>#</div>
                                <div>{editForm.id}</div>
                            </div>
                        }
                        <div className="adm-form-ceil org-form-ceil">
                            <div>Наименование</div>
                            <div><input type="text" value={editForm.name} onChange={this.changeName}/></div>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <div>&nbsp;</div>
                            <Button type="save" title="Сохранить" onClick={this.saveForm}/>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <div>&nbsp;</div>
                            <Button type="cancel" title="Отмена" onClick={this.cancelForm}/>
                        </div>
                    </div>
                </div>
            }
            {loaded &&
                <Search filter={filter} onChange={this.changeFilter}/>
            }
            {loaded &&
                <div className="table-row table-header">
                    <div className="table-ceil id">#</div>
                    <div className="table-ceil name">Наименование</div>
                    {!disabled &&
                        <div className="table-ceil actions"></div>
                    }
                </div>
            }
            {loaded && list.length === 0 &&
                <div className="table-row no-data">Классов не найдено</div>
            }
            {loaded && list.length > 0 &&
                list.map((cl) => {
                    if (find.length > 0 && cl.name.toLowerCase().indexOf(find) === -1) {
                        return null;
                    }
                    return <div className="table-row" key={"cl-row-" + cl.id}>
                        <div className="table-ceil id">{cl.id}</div>
                        <div className="table-ceil name">{cl.name}</div>
                        {!disabled &&
                            <div className="table-ceil actions">
                                <Button type="edit" title="Изменить" onClick={() => {
                                    this.edit(cl);
                                }}/>
                            </div>
                        }
                    </div>
                })
            }
        </div>;
    }
}
