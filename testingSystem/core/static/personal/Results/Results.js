class Results extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            list: [],
            teachers: [],
            subjects: [],
            classes: [],
            groupBy: 'class'
        }

    }

    componentDidMount() {
        const { token } = this.props;
        fetch("results/list",
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

    render() {
        const {
            loaded,
            list,
            groupBy,
            classes, teachers, subjects
        } = this.state;
        if (list.length > 0) {
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(drawChart);
            function drawChart() {
                let tbl_data = [];
                let title = "";
                if (groupBy === 'class') {
                    title = "классам";
                    let by_cl = {};
                    for (let i in list) {
                        let g = list[i].grade;
                        let c = list[i].class;
                        if (!(c in by_cl)) {
                            by_cl[c] = {1: 0, 2: 0, 3:0, 4:0, 5:0};
                        }
                        by_cl[c][g] += 1;
                    }
                    tbl_data.push(['Оценка']);
                    for (let i = 1; i <= 5; i++) {
                        tbl_data.push([i]);
                    }
                    Object.keys(by_cl).map((c) => {
                        tbl_data[0].push(classes.filter((cl) => cl['id'] == c)[0]['name'] + " класс");
                        Object.keys(by_cl[c]).map((g) => {
                            tbl_data[g].push(by_cl[c][g]);
                        })
                    })
                } else if (groupBy === "subject") {
                    title = "предметам";
                    let by_cl = {};
                    for (let i in list) {
                        let g = list[i].grade;
                        let c = list[i].subject;
                        if (!(c in by_cl)) {
                            by_cl[c] = {1: 0, 2: 0, 3:0, 4:0, 5:0};
                        }
                        by_cl[c][g] += 1;
                    }
                    tbl_data.push(['Оценка']);
                    for (let i = 1; i <= 5; i++) {
                        tbl_data.push([i]);
                    }
                    Object.keys(by_cl).map((c) => {
                        tbl_data[0].push(subjects.filter((cl) => cl['id'] == c)[0]['name']);
                        Object.keys(by_cl[c]).map((g) => {
                            tbl_data[g].push(by_cl[c][g]);
                        })
                    })

                } else if (groupBy === "teacher") {
                    title = "учителям";
                    let by_cl = {};
                    for (let i in list) {
                        let g = list[i].grade;
                        let c = list[i].teacher;
                        if (!(c in by_cl)) {
                            by_cl[c] = {1: 0, 2: 0, 3:0, 4:0, 5:0};
                        }
                        by_cl[c][g] += 1;
                    }
                    tbl_data.push(['Оценка']);
                    for (let i = 1; i <= 5; i++) {
                        tbl_data.push([i]);
                    }
                    Object.keys(by_cl).map((c) => {
                        // teachers.filter((cl) => cl['id'] != c)[0]['name'] ?? ''
                        tbl_data[0].push(teachers.filter((cl) => cl['id'] == c)[0]['name']);
                        Object.keys(by_cl[c]).map((g) => {
                            tbl_data[g].push(by_cl[c][g]);
                        })
                    })

                }
                var data = google.visualization.arrayToDataTable(tbl_data);

                var options = {
                    title : "Распределение оценок по " + title,
                    vAxis: {title: 'Количество оценок'},
                    hAxis: {title: 'Оценки', gridlines: {interval: 1}},
                    seriesType: 'bars',
                };

                var chart = new google.visualization.ComboChart(document.getElementById('chart'));
                chart.draw(data, options);
            }
        }
        return <div className="results-page">
            {!loaded && <Loader/>}
            {loaded &&
                <div className="graph-type-switch">
                    <span>Группировка оценок по</span>
                    <span className={"span-a " + (groupBy === 'class' ? "active" : "")} onClick={() => {this.setState({groupBy: "class"})}}>классам</span>
                    <span className={"span-a " + (groupBy === 'subject' ? "active" : "")} onClick={() => {this.setState({groupBy: "subject"})}}>предметам</span>
                    {teachers.length > 0 &&
                        <span className={"span-a " + (groupBy === 'teacher' ? "active" : "")} onClick={() => {this.setState({groupBy: "teacher"})}}>учителям</span>
                    }
                </div>
            }
            {loaded && <div id="chart"></div>}
        </div>
    }
}
