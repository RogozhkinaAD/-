class Search extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { filter, onChange } = this.props;
        return <div className="find-wrapper">
            <img src="/static/js/Search/search.svg" width="20px"/>
            <input type="text" value={filter} onChange={(e) => {
                onChange(e);
            }}/>
        </div>;
    }
}