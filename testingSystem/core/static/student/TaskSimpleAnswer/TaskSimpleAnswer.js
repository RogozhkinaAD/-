class TaskSimpleAnswer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answer: "",
        }

        this.inputAnswer = this.inputAnswer.bind(this);
    }

    inputAnswer(e) {
        const { setComplete } = this.props;
        this.setState({ answer: e.target.value});
        setComplete(e.target.value);
    }

    render() {
        const { q } = this.props;
        const { answer } = this.state;

        return <div className="simple-select-wrapper">
            <div className="question">{q.question}</div>
            <div className="answer-row">
                <input type="text" value={answer} onChange={this.inputAnswer}/>
            </div>
        </div>;
    }

}