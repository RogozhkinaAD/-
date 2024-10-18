class AuthForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: '',
            password: '',
            error: '',
        };
        this.login = this.login.bind(this);
        this.password = this.password.bind(this);
        this.checkAuth = this.checkAuth.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
    }

    login(e) {
        this.setState({login: e.target.value});
    }
    password(e) {
        this.setState({password: e.target.value});
    }
    checkAuth() {
        const { token } = this.props;
        const { login, password } = this.state;

        fetch("/user/auth",
            {
                method: 'POST',
                body: JSON.stringify({login, password}),
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
                        window.location = "/";
                    } else {
                        this.setState({ error: "error" in result ? result.error : "Ошибка авторизации" });
                    }
                },
                (error) => {
                    this.setState({ error: "Ошибка авторизации" });
                }
            );

    }
    handleEnter(event) {
        if (event.key === 'Enter') {
            this.checkAuth();
        }
    }


    render() {
        const { token } = this.props;
        const { login, password, error } = this.state;

        return <div id="auth-form-wrapper">
            {error.length > 0 &&
                <div className="error-wrapper">{error}</div>
            }
            <div className="row">
                <input type="text" value={login} onChange={this.login} onKeyPress={this.handleEnter} placeholder="Логин"/>
            </div>
            <div className="row">
                <input type="password" value={password} onChange={this.password} onKeyPress={this.handleEnter} placeholder="Пароль"/>
            </div>
            <div className="row">
                <button onClick={this.checkAuth}>Войти</button>
            </div>
        </div>;
    }
}