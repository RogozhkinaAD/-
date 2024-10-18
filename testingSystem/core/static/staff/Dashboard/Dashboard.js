class Dashboard extends React.Component {
    defaultOrgForm = {
        id: null,
        name: '',
        address: '',
        phone: '',
    }
    link2OrgPage = "/staff/org/"

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            loadError: '',

            filter: '',
            organizations: [],
            showOrgForm: false,
            formOrg: { ...this.defaultOrgForm },
        }

        this.changeFilter = this.changeFilter.bind(this);

        this.switchOrgForm = this.switchOrgForm.bind(this);
        this.changeOrgName = this.changeOrgName.bind(this);
        this.changeOrgAddress = this.changeOrgAddress.bind(this);
        this.changeOrgPhone = this.changeOrgPhone.bind(this);
        this.saveOrgForm = this.saveOrgForm.bind(this);
        this.cancelOrgForm = this.cancelOrgForm.bind(this);

        this.restoreOrganization = this.restoreOrganization.bind(this);
        this.editOrganization = this.editOrganization.bind(this);
        this.deleteOrganization = this.deleteOrganization.bind(this);
    }

    componentDidMount() {
        const { token } = this.props;
        fetch("/staff/getOrganizations",
            {
                method: 'GET',
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

    switchOrgForm() {
        const { showOrgForm} = this.state;
        this.setState({ showOrgForm: !showOrgForm });
    }
    changeOrgName(e) {
        const { formOrg} = this.state;
        formOrg.name = e.target.value;
        this.setState({ formOrg });
    }
    changeOrgAddress(e) {
        const { formOrg} = this.state;
        formOrg.address = e.target.value;
        this.setState({ formOrg });
    }
    changeOrgPhone(e) {
        const { formOrg} = this.state;
        formOrg.phone = e.target.value.replace(/[^\d|+]/g, '');
        this.setState({ formOrg });
    }
    saveOrgForm() {
        const { token } = this.props;
        const { organizations, formOrg } = this.state;
        fetch("/staff/org/edit",
            {
                method: 'POST',
                body: JSON.stringify({ ...formOrg }),
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
                        let orgs = [ ...organizations ];
                        if (formOrg.id === null) {
                            orgs.push({ ...result.organization });
                        } else {
                            orgs = orgs.map((o) => {
                                if (o.id === formOrg.id) {
                                    o.name = result.organization.name;
                                    o.address = result.organization.address;
                                    o.phone = result.organization.phone;
                                    o.phoneFormated = result.organization.phoneFormated;
                                    o.deleted = result.organization.deleted;
                                }
                                return o;
                            });
                        }

                        this.setState({ organizations: [ ...orgs ], formOrg: this.defaultOrgForm, showOrgForm: false });
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );

    }
    cancelOrgForm() {
        this.setState({ formOrg: this.defaultOrgForm, showOrgForm: false });
    }

    restoreOrganization(org) {
        if (!confirm("Восстановить орагнизацию " + org.name + "?")) {
            return;
        }

        const { token } = this.props;
        const { organizations } = this.state;
        fetch("/staff/org/restore",
            {
                method: 'POST',
                body: JSON.stringify({ id: org.id }),
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
                        const orgs = organizations.map((o) => {
                            if (o.id === org.id) {
                                o.deleted = 0;
                            }
                            return o;
                        });

                        this.setState({ organizations: [ ...orgs ], formOrg: this.defaultOrgForm, showOrgForm: false });
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }
    editOrganization(org) {
        this.setState(
            {
                formOrg: {
                    id: org.id,
                    name: org.name,
                    address: org.address,
                    phone: org.phone,
                },
                showOrgForm: true
            }
        );
    }
    deleteOrganization(org) {
        if (!confirm("Удалить орагнизацию " + org.name + "?")) {
            return;
        }

        const { token } = this.props;
        const { organizations } = this.state;
        fetch("/staff/org/delete",
            {
                method: 'POST',
                body: JSON.stringify({ id: org.id }),
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
                        const orgs = organizations.map((o) => {
                            if (o.id === org.id) {
                                o.deleted = 1;
                            }
                            return o;
                        });

                        this.setState({ organizations: [ ...orgs ], formOrg: this.defaultOrgForm, showOrgForm: false });
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
        const {
            filter,
            organizations, showOrgForm, formOrg,
            loaded, loadError
        } = this.state;

        let orgList = [ ...organizations ];
        if (filter.length > 0) {
            const find = filter.toLowerCase();
            orgList = orgList.filter(
                (o) => o.name.toLowerCase().indexOf(find) !== -1 ||
                    o.address.toLowerCase().indexOf(find) !== -1 ||
                    o.phone.indexOf(find.replace(/[^\d|+]/g, '')) !== -1);
        }

        return <div>
            {!loaded && <Loader/>}
            {loaded && loadError.length > 0 &&
                <div className="error">{loadError}</div>
            }
            {loaded && loadError.length === 0 &&
                <div className="table t-organization">
                    <Button type="add" title="Добавить" onClick={this.switchOrgForm}/>
                    <div className="adm-form org-form" style={showOrgForm ? {} : {display: "none"}}>
                        {formOrg.id !== null &&
                            <div className="adm-form-ceil org-form-ceil">
                                <div>#</div>
                                <div>{formOrg.id}</div>
                            </div>
                        }
                        <div className="adm-form-ceil org-form-ceil">
                            <div>Название</div>
                            <div><input type="text" value={formOrg.name} onChange={this.changeOrgName}/></div>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <div>Адрес</div>
                            <div><input type="text" value={formOrg.address} onChange={this.changeOrgAddress}/></div>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <div>Телефон</div>
                            <div><input type="text" value={formOrg.phone} onChange={this.changeOrgPhone}/></div>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <div>&nbsp;</div>
                            <Button type="save" title="Сохранить" onClick={this.saveOrgForm}/>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <div>&nbsp;</div>
                            <Button type="cancel" title="Отмена" onClick={this.cancelOrgForm}/>
                        </div>
                    </div>
                    <Search filter={filter} onChange={this.changeFilter}/>
                    <div className="table-row table-header">
                        <div className="table-ceil id">#</div>
                        <div className="table-ceil name">Название</div>
                        <div className="table-ceil address">Адрес</div>
                        <div className="table-ceil phone">Телефон</div>
                        <div className="table-ceil actions"></div>
                    </div>
                    {orgList.length === 0 &&
                        <div className="table-row no-data">Организаций не найдено</div>
                    }
                    {orgList.length > 0 &&
                        orgList.map((org) => {
                            return <div className={"table-row " + (org.deleted == 1 ? "deleted" : "")} key={"org-row-" + org.id}>
                                <div className="table-ceil id">{org.id}</div>
                                <div className="table-ceil name">
                                    <a href={this.link2OrgPage + org.id}>{org.name}</a>
                                </div>
                                <div className="table-ceil address">{org.address}</div>
                                <div className="table-ceil phone">{org.phoneFormated}</div>
                                <div className="table-ceil actions">
                                    {org.deleted == 1 &&
                                        <Button type="restore" title="Восстановить" onClick={() => {
                                            this.restoreOrganization(org);
                                        }}/>
                                    }
                                    {org.deleted == 0 &&
                                        <Button type="edit" title="Изменить" onClick={() => {
                                            this.editOrganization(org);
                                        }}/>
                                    }
                                    {org.deleted == 0 &&
                                        <Button type="delete" title="Удалить" onClick={() => {
                                            this.deleteOrganization(org);
                                        }}/>
                                    }
                                </div>
                            </div>
                        })
                    }
                </div>
            }
        </div>;
    }
}

class ClassesStaff extends React.Component {
    defaultForm = {
        id: null,
        name: '',
    }

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            loadError: '',

            filter: '',
            classes: [],
            showForm: false,
            editForm: { ...this.defaultForm },
        }

        this.changeFilter = this.changeFilter.bind(this);

        this.switchForm = this.switchForm.bind(this);
        this.changeName = this.changeName.bind(this);
        this.saveForm = this.saveForm.bind(this);
        this.cancelForm = this.cancelForm.bind(this);

        this.edit = this.edit.bind(this);
    }

    componentDidMount() {
        const { token } = this.props;
        fetch("/staff/getClasses",
            {
                method: 'GET',
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
    saveForm() {
        const { token } = this.props;
        const { classes, editForm } = this.state;
        fetch("/staff/editClasses",
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
                        let cls = [ ...classes ];
                        if (editForm.id === null) {
                            cls.push({ ...result.cl });
                        } else {
                            cls = cls.map((c) => {
                                if (c.id === editForm.id) {
                                    c.name = result.cl.name;
                                }
                                return c;
                            });
                        }

                        this.setState({ classes: [ ...cls ], editForm: { ...this.defaultForm }, showForm: false });
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

    render() {
        const {
            filter,
            classes, showForm, editForm,
            loaded, loadError
        } = this.state;

        let classesList = [ ...classes ];
        if (filter.length > 0 && classesList.length > 0) {
            const find = filter.toLowerCase();
            classesList = classesList.filter((o) => o.name.toLowerCase().indexOf(find) !== -1);
        }

        return <div>
            {!loaded && <Loader/>}
            {loaded && loadError.length > 0 &&
                <div className="error">{loadError}</div>
            }
            {loaded && loadError.length === 0 &&
                <div className="table classes">
                    <img
                        src="/static/images/button-add.svg"
                        onClick={this.switchForm}
                        title="Добавить"
                        className="img-button"
                    />
                    <div className="adm-form org-form" style={showForm ? {} : {display: "none"}}>
                        {editForm.id !== null &&
                            <div className="adm-form-ceil org-form-ceil">
                                <div>#</div>
                                <div>{editForm.id}</div>
                            </div>
                        }
                        <div className="adm-form-ceil org-form-ceil">
                            <div>Название</div>
                            <div><input type="text" value={editForm.name} onChange={this.changeName}/></div>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <img
                                src={"/static/images/button-save.svg"}
                                title="Сохранить"
                                onClick={this.saveForm}
                                className="img-button"
                            />
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <img
                                src={"/static/images/button-cancel.svg"}
                                title="Отмена"
                                onClick={this.cancelForm}
                                className="img-button"
                            />
                        </div>
                    </div>
                    <div className="find-wrapper">
                        <input type="text" value={filter} onChange={this.changeFilter}/>
                    </div>
                    <div className="table-row table-header">
                        <div className="table-ceil id">#</div>
                        <div className="table-ceil name">Название</div>
                        <div className="table-ceil actions"></div>
                    </div>
                    {classesList.length === 0 &&
                        <div className="table-row no-data">Классов не найдено</div>
                    }
                    {classesList.length > 0 &&
                        classesList.map((cl) => {
                            return <div className="table-row" key={"cl-row-" + cl.id}>
                                <div className="table-ceil id">{cl.id}</div>
                                <div className="table-ceil name">{cl.name}</div>
                                <div className="table-ceil actions">
                                    <img
                                        src={"/static/images/button-edit.svg"}
                                        title="Изменить"
                                        onClick={() => {
                                            this.edit(cl);
                                        }}
                                        className="img-button"
                                    />
                                </div>
                            </div>
                        })
                    }
                </div>
            }
        </div>;
    }
}
class SubjectsStaff extends React.Component {
    defaultForm = {
        id: null,
        name: '',
    }

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            loadError: '',

            filter: '',
            subjects: [],
            showForm: false,
            editForm: { ...this.defaultForm },
        }

        this.changeFilter = this.changeFilter.bind(this);

        this.switchForm = this.switchForm.bind(this);
        this.changeName = this.changeName.bind(this);
        this.saveForm = this.saveForm.bind(this);
        this.cancelForm = this.cancelForm.bind(this);

        this.edit = this.edit.bind(this);
    }

    componentDidMount() {
        const { token } = this.props;
        fetch("/staff/getSubjects",
            {
                method: 'GET',
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
        const { editForm} = this.state;
        editForm.name = e.target.value;
        this.setState({ editForm });
    }
    saveForm() {
        const { token } = this.props;
        const { subjects, editForm } = this.state;
        fetch("/staff/editSubjects",
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
                        let cls = [ ...subjects ];
                        if (editForm.id === null) {
                            cls.push({ ...result.subject });
                        } else {
                            cls = cls.map((c) => {
                                if (c.id === editForm.id) {
                                    c.name = result.subject.name;
                                }
                                return c;
                            });
                        }

                        this.setState({ subjects: [ ...cls ], editForm: { ...this.defaultForm }, showForm: false });
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

    render() {
        const {
            filter,
            subjects, showForm, editForm,
            loaded, loadError
        } = this.state;

        let classesList = [ ...subjects ];
        if (filter.length > 0) {
            const find = filter.toLowerCase();
            classesList = classesList.filter((o) => o.name.toLowerCase().indexOf(find) !== -1);
        }

        return <div>
            {!loaded && <Loader/>}
            {loaded && loadError.length > 0 &&
                <div className="error">{loadError}</div>
            }
            {loaded && loadError.length === 0 &&
                <div className="table subjects">
                    <img
                        src="/static/images/button-add.svg"
                        onClick={this.switchForm}
                        title="Добавить"
                        className="img-button"
                    />
                    <div className="adm-form org-form" style={showForm ? {} : {display: "none"}}>
                        {editForm.id !== null &&
                            <div className="adm-form-ceil org-form-ceil">
                                <div>#</div>
                                <div>{editForm.id}</div>
                            </div>
                        }
                        <div className="adm-form-ceil org-form-ceil">
                            <div>Название</div>
                            <div><input type="text" value={editForm.name} onChange={this.changeName}/></div>
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <img
                                src={"/static/images/button-save.svg"}
                                title="Сохранить"
                                onClick={this.saveForm}
                                className="img-button"
                            />
                        </div>
                        <div className="adm-form-ceil org-form-ceil">
                            <img
                                src={"/static/images/button-cancel.svg"}
                                title="Отмена"
                                onClick={this.cancelForm}
                                className="img-button"
                            />
                        </div>
                    </div>
                    <div className="find-wrapper">
                        <input type="text" value={filter} onChange={this.changeFilter}/>
                    </div>
                    <div className="table-row table-header">
                        <div className="table-ceil id">#</div>
                        <div className="table-ceil name">Название</div>
                        <div className="table-ceil actions"></div>
                    </div>
                    {classesList.length === 0 &&
                        <div className="table-row no-data">Классов не найдено</div>
                    }
                    {classesList.length > 0 &&
                        classesList.map((cl) => {
                            return <div className="table-row" key={"cl-row-" + cl.id}>
                                <div className="table-ceil id">{cl.id}</div>
                                <div className="table-ceil name">{cl.name}</div>
                                <div className="table-ceil actions">
                                    <img
                                        src={"/static/images/button-edit.svg"}
                                        title="Изменить"
                                        onClick={() => {
                                            this.edit(cl);
                                        }}
                                        className="img-button"
                                    />
                                </div>
                            </div>
                        })
                    }
                </div>
            }
        </div>;
    }
}
