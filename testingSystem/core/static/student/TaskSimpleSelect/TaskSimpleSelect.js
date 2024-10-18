class TaskSimpleSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            setCorrected: {}
        }

        this.setCorrected = this.setCorrected.bind(this);
    }

    setCorrected(id) {
        const { setComplete, q } = this.props;
        const { setCorrected } = this.state;
        let newSetCorrected = { ...setCorrected };
        if (q.checkbox) {
            if (id in newSetCorrected) {
                delete newSetCorrected[id];
            } else {
                newSetCorrected[id] = id;
            }
        } else {
            newSetCorrected = {};
            newSetCorrected[id] = id;
        }
        this.setState({ setCorrected: { ...newSetCorrected }});
        setComplete(Object.keys(newSetCorrected));
    }

    render() {
        const { q } = this.props;
        const { setCorrected } = this.state;

        return <div className="simple-select-wrapper">
            <div className="question">{q.question}</div>
            {q.answers.map((a) => {
                return <div
                    className="answer-row" key={"a-" + a.id}
                    onClick={() => {this.setCorrected(a.id);}}
                >
                    {q.checkbox && !(a.id in setCorrected) &&
                        <img src="/static/student/TaskSimpleSelect/unchecked.svg"/>
                    }
                    {q.checkbox && a.id in setCorrected &&
                        <img src="/static/student/TaskSimpleSelect/checked.svg"/>
                    }
                    {!q.checkbox && !(a.id in setCorrected) &&
                        <img src="/static/student/TaskSimpleSelect/unselected.svg"/>
                    }
                    {!q.checkbox && a.id in setCorrected &&
                        <img src="/static/student/TaskSimpleSelect/selected.svg"/>
                    }
                    <div>{a.text}</div>
                </div>
            })}
        </div>;
    }

}