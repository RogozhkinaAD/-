class Select extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDD: false,
        }
        this.switchDD = this.switchDD.bind(this);
        this.selectRow = this.selectRow.bind(this);
    }

    switchDD() {
        const { showDD } = this.state;
        this.setState({ showDD: !showDD });
    }


    selectRow(id) {
        const { callback } = this.props;
        callback(id);
        this.setState({ showDD: false });
    }

    render() {
        const { selected, list } = this.props;
        const { showDD } = this.state;
        return <div className="select-im">
            <div className="visible" onClick={this.switchDD}>
                {!selected && "Выбрать"}
                {selected}
                <img src="/static/js/Select/dd.svg" width="24px"/>
            </div>
            {showDD &&
                <div className="drop-down">
                    {list.map((e) => (
                        <div
                            className="dd-row"
                            key={"ddr-" + e.id}
                            onClick={() => {
                                this.selectRow(e.id);
                            }}
                        >
                            {e.name}
                        </div>
                    ))}
                </div>
            }
        </div>
            ;
    }
}