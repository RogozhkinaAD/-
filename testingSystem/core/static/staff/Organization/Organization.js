class Organization extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            loadError: '',
            tab: "admins",
            admins: [],
            teachers: [],
        }

        this.switchTab = this.switchTab.bind(this);
    }

    componentDidMount() {
        const { token, id } = this.props;
        fetch("/staff/org/" + id + "/personal",
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

    switchTab(tab) {
        this.setState({ tab: tab });
    }

    render() {
        const {
            loaded, loadError, tab,
            admins, teachers
        } = this.state;
        const { token, id, deleted } = this.props;

        return <div id="organization-container">
            {!loaded && <Loader/>}
            {loaded && loadError.length > 0 &&
                <div className="error">{loadError}</div>
            }
            {loaded && loadError.length === 0 &&
                <div className="table-wrapper">
                    <div className="tabs">
                        <div
                            className={"tab " + (tab === 'admins' ? 'active' : '')}
                            onClick={() => {
                                this.switchTab('admins');
                            }}
                        >Руководство
                        </div>
                        <div
                            className={"tab " + (tab === 'teaches' ? 'active' : '')}
                            onClick={() => {
                                this.switchTab('teaches');
                            }}
                        >Пед. состав
                        </div>
                    </div>
                    <div className="tabs-content">
                        <div className={"tabc " + (tab === 'admins' ? 'active' : '')}>
                            <Personal layer="admin" token={token} list={admins} id={id} disabled={deleted}/>
                        </div>
                        <div className={"tabc " + (tab === 'teaches' ? 'active' : '')}>
                            <Personal layer="teacher" token={token} list={teachers} id={id} disabled={deleted}/>
                        </div>
                    </div>
                </div>
            }
        </div>
    }
}
