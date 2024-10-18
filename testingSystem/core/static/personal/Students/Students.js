class Students extends React.Component {
    constructor(props) {
        super(props);
        this.defaultForm = {
            id: null,
            last_name: '',
            first_name: '',
            second_name: '',
            email: '',
            login: '',
            password: '',
            classId: 0,
            className: '',
        }
        this.state = {
            loaded: false,
            showForm: false,
            showClassesDropDown: false,
            editForm: { ...this.defaultForm },

            filter: '',
            list: [],
            newPass: {
                fio: '',
                pass: '',
                show: false,
            }
        }

        this.getClassById = this.getClassById.bind(this);

        this.switchForm = this.switchForm.bind(this);
        this.selectClassCallback = this.selectClassCallback.bind(this);

        this.changeFromInput = this.changeFromInput.bind(this);
        this.saveForm = this.saveForm.bind(this);
        this.cancelForm = this.cancelForm.bind(this);

        this.resetPasswordProcess = this.resetPasswordProcess.bind(this);

        this.changeFilter = this.changeFilter.bind(this);

        this.generateLogin = this.generateLogin.bind(this);
        this.generatePassword = this.generatePassword.bind(this);

        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
        this.restore = this.restore.bind(this);
    }

    componentDidMount() {
        const { token } = this.props;
        fetch("/personal/students/list",
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

    getClassById(id) {
        const { classes } = this.state;
        for (let i in classes) {
            let cl = classes[i];
            if (cl.id == id) {
                return cl;
            }
        }
        return undefined;
    }

    switchForm() {
        const { showForm} = this.state;
        this.setState({ showForm: !showForm });
    }
    selectClassCallback(id) {
        const { editForm } = this.state;

        const cl = this.getClassById(id)
        if (cl == undefined) {
            editForm.classId = 0;
            editForm.className = '';
        } else {
            editForm.classId = id;
            editForm.className = cl.name;
        }
        this.setState({ editForm: { ...editForm }});
    }


    changeFromInput(e) {
        const { editForm } = this.state;
        editForm[e.target.name] = e.target.value;
        this.setState({ editForm });
    }
    saveForm() {
        const { token } = this.props;
        const { editForm, list } = this.state;
        fetch("/personal/student/edit",
            {
                method: 'POST',
                body: JSON.stringify({ ...editForm }),
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
                            pers.push({ ...result.user });
                        } else {
                            pers = pers.map((c) => {
                                if (c.id === editForm.id) {
                                    c = { ...result.user };
                                }
                                return c;
                            });
                        }

                        this.setState({ list: [ ...pers ], editForm: { ...this.defaultForm }, showForm: false });
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }
    cancelForm() {
        this.setState({ editForm: { ...this.defaultForm }, showForm: false });
    }

    resetPasswordProcess(p) {
        if (!confirm("Сбросить пароль для " + p.last_name + " " + p.first_name + " " + p.second_name + "?")) {
            return;
        }
        const { token } = this.props;
        fetch("/personal/student/resetPassword",
            {
                method: 'POST',
                body: JSON.stringify({ id: p.id }),
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
                        this.setState(
                            {
                                newPass: {
                                    fio: p.last_name + " " + p.first_name + " " + p.second_name,
                                    pass: result.data,
                                    show: true
                                }
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

    changeFilter(e) {
        this.setState({ filter: e.target.value });
    }

    generateLogin() {
        const { editForm, showForm } = this.state;
        const { id } = this.props;
        if (!showForm) {
            return;
        }

        if (editForm.first_name.length == 0 || editForm.last_name == 0) {
            alert("Необходимо заполнить фамилию и имя польщователя");
            return;
        }

        editForm.login = (
            Utils.transliterate(editForm.first_name[0]) +
            Utils.transliterate(editForm.last_name)
        ).toLowerCase() + "_" + id + "_student";
        this.setState({ editForm: { ...editForm } });
    }
    generatePassword() {
        const { token } = this.props;
        const { editForm } = this.state;
        fetch("/generatePassword",
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
                        editForm.password = result.data;
                        this.setState({ editForm: { ...editForm } });
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }

    edit(person) {
        const form = { ...this.defaultForm }
        form.id = person.id;
        form.first_name = person.first_name;
        form.second_name = person.second_name;
        form.last_name = person.last_name;
        form.login = person.login;
        form.email = person.email;

        const cl = this.getClassById(person.classId)
        if (cl == undefined) {
            form.classId = 0;
            form.className = '';
        } else {
            form.classId = id;
            form.className = cl.name;
        }

        this.setState({ editForm: { ...form }, showForm: true });
    }
    delete(person) {
        if (!confirm("Удалить " + person.last_name + " " + person.first_name + " " + person.second_name + "?")) {
            return;
        }
        const { token } = this.props;
        const { list } = this.state;
        fetch("/personal/student/delete",
            {
                method: 'POST',
                body: JSON.stringify({ id: person.id }),
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
                        pers = pers.map((c) => {
                            if (c.id === person.id) {
                                c.deleted = true;
                            }
                            return c;
                        });

                        this.setState({ list: [ ...pers ] });
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }
    restore(person) {
        if (!confirm("Восстановить " + person.last_name + " " + person.first_name + " " + person.second_name + "?")) {
            return;
        }
        const { token } = this.props;
        const { list } = this.state;
        fetch("/personal/student/restore",
            {
                method: 'POST',
                body: JSON.stringify({ id: person.id }),
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
                        pers = pers.map((c) => {
                            if (c.id === person.id) {
                                c.deleted = false;
                            }
                            return c;
                        });

                        this.setState({ list: [ ...pers ] });
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
        const { disabled } = this.props;
        const { loaded ,list, classes, showForm, editForm, filter, newPass } = this.state;

        let studentsList = [ ...list ];
        if (filter.length > 0 && studentsList.length > 0) {
            const find = filter.toLowerCase();
            studentsList = studentsList.filter(
                (o) => o.first_name.toLowerCase().indexOf(find) !== -1 ||
                    o.second_name.toLowerCase().indexOf(find) !== -1 ||
                    o.last_name.toLowerCase().indexOf(find) !== -1 ||
                    o.login.toLowerCase().indexOf(find) !== -1 ||
                    o.email.toLowerCase().indexOf(find) !== -1
            );
        }

        const clList = {}
        for (let i in classes) {
            clList[classes[i].id] = classes[i].name;
        }


        return <div className="personal">
            {!loaded && <Loader/>}
            {loaded && !disabled &&
                <div>
                    <Button type="add" title="Добавить" onClick={this.switchForm}/>
                    <div className="adm-form students-form" style={showForm ? {} : {display: "none"}}>
                        {editForm.id !== null &&
                            <div className="adm-form-ceil org-form-ceil">
                                <div>#</div>
                                <div>{editForm.id}</div>
                            </div>
                        }
                        <div className="adm-form-ceil org-form-ceil">
                            <div>Класс</div>
                            <Select list={classes} callback={(i) => this.selectClassCallback(i)} selected={editForm.className}/>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <div>Фамилия</div>
                            <div><input type="text" name="last_name" value={editForm.last_name}
                                        onChange={this.changeFromInput}/></div>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <div>Имя</div>
                            <div><input type="text" name="first_name" value={editForm.first_name}
                                        onChange={this.changeFromInput}/></div>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <div>Отчество</div>
                            <div><input type="text" name="second_name" value={editForm.second_name}
                                        onChange={this.changeFromInput}/></div>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <div>
                                Логин&nbsp;
                                <span
                                    className="span-link"
                                    title="Сгенерировать логин пользователя"
                                    onClick={this.generateLogin}
                                >Сгененрировать</span>
                            </div>
                            <div><input type="text" name="login" value={editForm.login}
                                        onChange={this.changeFromInput}/>
                            </div>
                        </div>
                        {editForm.id == null &&
                            <div className="adm-form-ceil org-form-ceil">
                                <div>
                                    Пароль&nbsp;
                                    <span
                                        className="span-link"
                                        title="Сгенерировать пароль пользователя"
                                        onClick={this.generatePassword}
                                    >Сгененрировать</span>
                                </div>
                                <div><input type="text" name="password" value={editForm.password}
                                            onChange={this.changeFromInput}/>
                                </div>
                            </div>
                        }
                        <div className="adm-form-ceil org-form-ceil">
                            <div>E-mail</div>
                            <div><input type="text" name="email" value={editForm.email}
                                        onChange={this.changeFromInput}/>
                            </div>
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
            {loaded && newPass.show &&
                <div className="adm-form org-form new-pass">
                    Новый пароль для {newPass.fio}: <span>{newPass.pass}</span>
                    <Button type="ok" title="Закрыть" onClick={() => {
                        this.setState({ newPass: { fio: '', pass: '', show: false } });
                    }}/>
                </div>
            }
            <Search filter={filter} onChange={this.changeFilter}/>
            <div className="table students-table">
                <div className="table-row table-header">
                    <div className="table-ceil id">#</div>
                    <div className="table-ceil class-name">Класс</div>
                    <div className="table-ceil name">ФИО</div>
                    <div className="table-ceil login">Логин</div>
                    <div className="table-ceil email">E-mail</div>
                    {!disabled &&
                        <div className="table-ceil actions"></div>
                    }
                </div>
                {studentsList.length === 0 &&
                    <div className="table-row no-data">Учеников не найдено</div>
                }
                {studentsList.length > 0 &&
                    studentsList.map(
                        (p) => <div className={"table-row " + (p.deleted ? "deleted" : "")} key={"user-" + p.id}>
                            <div className="table-ceil id">{p.id}</div>
                            <div className="table-ceil class-name">{p.classId in clList ? clList[p.classId] : "-"}</div>
                            <div className="table-ceil name">{p.last_name} {p.first_name} {p.second_name}</div>
                            <div className="table-ceil login">{p.login}</div>
                            <div className="table-ceil email">{p.email}</div>
                            {!disabled &&
                                <div className="table-ceil actions">
                                    {p.deleted == 1 &&
                                        <Button type="restore" title="Восстановить" onClick={() => {
                                            this.restore(p);
                                        }}/>
                                    }
                                    {p.deleted == 0 &&
                                        <Button type="edit" title="Изменить" onClick={() => {
                                            this.edit(p);
                                        }}/>
                                    }
                                    {p.deleted == 0 &&
                                        <Button type="delete" title="Удалить" onClick={() => {
                                            this.delete(p);
                                        }}/>
                                    }
                                    {p.deleted == 0 &&
                                        <Button type="pass" title="Сбросить пароль" onClick={() => {
                                            this.resetPasswordProcess(p)
                                        }}/>
                                    }
                                </div>
                            }
                        </div>
                    )
                }
            </div>
        </div>
    }
}
