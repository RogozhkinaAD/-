class TaskManager extends React.Component {
    constructor(props) {
        super(props);

        this.rowTypes = [
            {id: 'simpleSelect', name: "Выбор ответа"},
            {id: 'simpleAnswer', name: "Ответ на вопрос (Краткий)"},
            {id: 'advancedAnswer', name: "Ответ на вопрос (Развернутый)"},
        ]

        this.state = {
            loaded: this.props.id === null,
            subjectsLoaded: this.props.id !== null,

            id: this.props.id,
            subject_id: 0,
            name: '',
            description: '',
            content: [],
            criteria: { 1: 18, 2: 36, 3: 54, 4: 72, 5: 90 },
            deleted: false,
            in_production: false,

            subjects: [],

            rowAddShow: false,
            editTaskFormShow: [],
        }

        this.taskSaveClick = this.taskSaveClick.bind(this);
        this.taskCancelClick = this.taskCancelClick.bind(this);

        this.saveCallback = this.saveCallback.bind(this);
        this.cancelCallback = this.cancelCallback.bind(this);
        this.editClick = this.editClick.bind(this);
        this.deleteClick = this.deleteClick.bind(this);
        this.criteriaInput = this.criteriaInput.bind(this);
    }

    componentDidMount() {
        const { loaded, subjectsLoaded, id } = this.state;
        if (!loaded) {
            if (id === null) {
                this.setState({ loaded: true });
            } else {
                fetch("/personal/task/get/" + id,
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
                                this.setState(
                                    {
                                        subject_id: result.subject_id,
                                        name: result.name,
                                        description: result.description,
                                        content: [ ...result.content ],
                                        criteria: { ...result.criteria },
                                        deleted: result.deleted,
                                        in_production: result.in_production,

                                        subjects: [ ...result.subjects ],
                                        subjectsLoaded: true,
                                        loaded: true
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
        } else if (!subjectsLoaded) {
            fetch("/personal/subjects/list",
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
                            this.setState({ subjects: [ ...result.list ], subjectsLoaded: true });
                        } else {
                            alert("message" in result ? result.message : "Ошибка загрузки данных");
                        }
                    },
                    (error) => {
                        alert("Ошибка запроса данных");
                    }
                );
        }

    }

    taskSaveClick() {
        const { token } = this.props;
        const { id, subject_id, name, description, content, criteria  } = this.state;
        fetch("/personal/task/save",
            {
                method: 'POST',
                body: JSON.stringify(
                    {
                        id: id === null ? 0 : id,
                        subject_id: subject_id,
                        name: name,
                        description: description,
                        content: [ ...content ],
                        criteria: { ...criteria },
                    }
                ),
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
                        alert('Задание сохранено');
                        location.href = "/";
                    } else {
                        alert("message" in result ? result.message : "Ошибка загрузки данных");
                    }
                },
                (error) => {
                    alert("Ошибка запроса данных");
                }
            );
    }
    taskCancelClick() {
        if (!confirm("Закрыть без сохранения?")) {
            return;
        }
        location.href = "/";
    }

    saveCallback(contentRow) {
        const { content } = this.state;

        const cRowId = contentRow.id;
        let max_id = 0;

        const nc = content.map((c) => {
            if (contentRow.id === null && c.id > max_id) {
                max_id = c.id;
            }
            if (contentRow.id !== null && c.id === contentRow.id) {
                c = { ...contentRow };
            }
            return c;
        });
        if (contentRow.id === null) {
            contentRow.id = max_id + 1;
            nc.push(contentRow);
        }
        this.setState({ content: [ ...nc ] });
        this.cancelCallback({ id: cRowId });
    }
    cancelCallback(contentRow) {
        const { editTaskFormShow } = this.state;
        if (contentRow.id === null) {
            this.setState({ rowAddShow: false });
        } else {
            this.setState(
                { editTaskFormShow: editTaskFormShow.filter((id) => contentRow.id !== id) }
            )
        }
    }

    editClick(id) {
        const { editTaskFormShow } = this.state;
        if (editTaskFormShow.indexOf(id) === -1) {
            editTaskFormShow.push(id);
            this.setState({ editTaskFormShow: editTaskFormShow });
        }
    }
    deleteClick(id) {
        const { content } = this.state;

        let ind = -1;
        let contentRow = {};
        for (let i in content) {
            if (content[i].id == id) {
                ind = i;
                contentRow = { ...content[i] }
                break;
            }
        }
        if (ind === -1) {
            return false;
        }

        if (!confirm("Удалить задание? \n" + contentRow.question)) {
            return;
        }
        this.setState(
            { content: content.filter((r) => r.id !== id) }
        )
    }

    criteriaInput(id, value) {
        if ((id < 5 && value >= 100) || (id === 5 && value > 100)) {
            return;
        }
        const { criteria } = this.state;
        criteria[id] = value;
        this.setState({ criteria: { ...criteria }});
    }

    renderMainButtons(canEdit) {
        return <span>
            {canEdit &&
                <Button type="save" title="Сохранить изменения" onClick={this.taskSaveClick}/>
            }
            <Button type="cancel" title="Не сохранять изменения" onClick={this.taskCancelClick}/>
        </span>
    }
    renderSubjectSelector(canEdit) {
        const {subject_id, subjectsLoaded, subjects} = this.state;

        let selectedSubject = ''
        if (subject_id > 0) {
            for (let s in subjects) {
                if (subjects[s].id === subject_id) {
                    selectedSubject = subjects[s].name;
                    break;
                }
            }
        }
        return <div className="task-form-row">
            <div className="task-form-row-title">Предмет:</div>
            <div className="task-form-row-content subject-selector">
                {!subjectsLoaded && <Loader/>}
                {subjectsLoaded && canEdit &&
                    <Select selected={selectedSubject} list={subjects}
                            callback={(id) => this.setState({subject_id: id})}/>
                }
                {subjectsLoaded && !canEdit &&
                    <input type="text" value={selectedSubject} disabled={true}/>
                }
            </div>
        </div>
    }
    renderName(canEdit) {
        const { name } = this.state;
        return <div className="task-form-row">
            <div className="task-form-row-title">Название:</div>
            <div className="task-form-row-content">
                <input
                    type="text"
                    value={name}
                    disabled={!canEdit}
                    onChange={(e) => this.setState({name: e.target.value})}
                    style={{width: '100%'}}
                />
            </div>
        </div>
    }
    renderDescription(canEdit) {
        const { description } = this.state;
        return <div className="task-form-row">
            <div className="task-form-row-title">Описание:</div>
            <div className="task-form-row-content">
                    <textarea
                        disabled={!canEdit}
                        style={{width: '100%', height: '100px'}}
                        onChange={(e) => this.setState({description: e.target.value})}
                        value={description}
                    />
            </div>
        </div>
    }
    renderContent(canEdit) {
        const { content, rowAddShow, editTaskFormShow } = this.state;
        return <div className="task-form-row">
            <div className="task-form-row-title">Вопросы:</div>
            <div className="task-form-row-content block">
                {canEdit && !rowAddShow &&
                    <Button type="add" title="Добавить" onClick={() => this.setState({ rowAddShow: true })}/>
                }
                {rowAddShow &&
                    <TaskEditor
                        canEdit={canEdit}
                        content={{ id: null, type: "" }}
                        saveCallback={this.saveCallback}
                        cancelCallback={this.cancelCallback}
                    />
                }
                {content.map((c) => {
                    const showForm = editTaskFormShow.indexOf(c.id) !== -1;
                    return <div className="content-view-row" key={"cvr-" + c.id}>
                        {c.type === 'simpleSelect' && !showForm &&
                            <SimpleSelectView task={c} editClick={this.editClick} deleteClick={this.deleteClick}/>
                        }
                        {c.type === 'simpleSelect' && showForm &&
                            <TaskEditor
                                content={c}
                                saveCallback={this.saveCallback}
                                cancelCallback={this.cancelCallback}
                            />
                        }
                        {c.type === 'simpleAnswer' && !showForm &&
                            <SimpleAnswerView task={c} editClick={this.editClick} deleteClick={this.deleteClick}/>
                        }
                        {c.type === 'simpleAnswer' && showForm &&
                            <TaskEditor
                                content={c}
                                saveCallback={this.saveCallback}
                                cancelCallback={this.cancelCallback}
                            />
                        }
                    </div>
                })}
            </div>
        </div>
    }
    renderCriteria(canEdit) {
        const { criteria } = this.state;
        return <div className="task-form-row">
            <div className="task-form-row-title">Критерии оценки:</div>
            <div className="task-form-row-content block">
                <div className="tfrc-criteria-row">
                    <div>1: до</div>
                    <div>
                        <input
                            onChange={(e) => {this.criteriaInput(1, e.target.value);}}
                            value={criteria[1]}
                            disabled={!canEdit}
                        />
                    </div>
                    <div>%</div>
                </div>
                <div className="tfrc-criteria-row">
                    <div>2: до</div>
                    <div>
                        <input
                            onChange={(e) => {
                                this.criteriaInput(2, e.target.value);
                            }}
                            value={criteria[2]}
                            disabled={!canEdit}
                        />
                    </div>
                    <div>%</div>
                </div>
                <div className="tfrc-criteria-row">
                    <div>3: до</div>
                    <div>
                        <input
                            onChange={(e) => {
                                this.criteriaInput(3, e.target.value);
                            }}
                            value={criteria[3]}
                            disabled={!canEdit}
                        />
                    </div>
                    <div>%</div>
                </div>
                <div className="tfrc-criteria-row">
                    <div>4: до</div>
                    <div>
                        <input
                            onChange={(e) => {
                                this.criteriaInput(4, e.target.value);
                            }}
                            value={criteria[4]}
                            disabled={!canEdit}
                        />
                    </div>
                    <div>%</div>
                </div>
                <div className="tfrc-criteria-row">
                    <div>5: до</div>
                    <div>
                        <input
                            onChange={(e) => {
                                this.criteriaInput(5, e.target.value);
                            }}
                            value={criteria[5]}
                            disabled={!canEdit}
                        />
                    </div>
                    <div>%</div>
                </div>
            </div>
        </div>
    }

    render() {
        const {id, disabled} = this.props;
        const {deleted, in_production, loaded} = this.state;

        const canEdit = !disabled && !deleted && !in_production;

        return <div>
            {!loaded && <Loader/>}
            {loaded &&
                <div className="task-form-wrapper">
                    {this.renderMainButtons(canEdit)}
                    {/*{this.renderTitle(id, canEdit)}*/}
                    {this.renderSubjectSelector(canEdit)}
                    {this.renderName(canEdit)}
                    {this.renderDescription(canEdit)}
                    {this.renderContent(canEdit)}
                    {this.renderCriteria(canEdit)}
                    {this.renderMainButtons(canEdit)}
                </div>
            }
        </div>;
    }
}

class TaskEditor extends React.Component {
    rowTypes = {
        simpleSelect: {id: 'simpleSelect', name: "Выбор ответа"},
        simpleAnswer: {id: 'simpleAnswer', name: "Ответ на вопрос (Краткий)"},
        advancedAnswer: {id: 'advancedAnswer', name: "Ответ на вопрос (Развернутый)"},
    }
    constructor(props) {
        super(props);

        this.state = {
            contentRow: "content" in this.props ? this.props.content : {}
        }
        this.selectType = this.selectType.bind(this);
    }

    selectType(id) {
        const { contentRow } = this.state;
        contentRow.type = id;
        this.setState({ ...contentRow });
    }

    render() {
        const { canEdit, saveCallback, cancelCallback } = this.props;
        const { contentRow } = this.state;
        const cTypeName = contentRow.type in this.rowTypes ? this.rowTypes[contentRow.type]['name'] : "";

        return <div className='task-editor-form'>
            <div className="task-editor-row select-type">
                <div>Тип задания:</div>
                {canEdit &&
                    <Select
                        selected={cTypeName}
                        list={Object.values(this.rowTypes)}
                        callback={this.selectType}/>
                }
                {!canEdit &&
                    <input type="text" value={cTypeName} disabled={true}/>
                }
            </div>
            {contentRow.type === 'simpleSelect' &&
                <SimpleSelectEditor
                    content={contentRow}
                    saveCallback={(row) => saveCallback(row)}
                    cancelCallback={(row) => cancelCallback(row)}
                />
            }
            {contentRow.type === 'simpleAnswer' &&
                <SimpleAnswerEditor
                    content={contentRow}
                    saveCallback={(row) => saveCallback(row)}
                    cancelCallback={(row) => cancelCallback(row)}
                />
            }
        </div>
    }
}

class SimpleSelectEditor extends React.Component {
    constructor(props) {
        super(props);

        const content = 'content' in this.props ? this.props['content'] : {};

        this.state = {
            id: 'id' in content ? content['id'] : null,
            question: 'question' in content ? content['question'] : "",
            answers: 'answers' in content ? content['answers'] : [],
        }
        this.clickAnswer = this.clickAnswer.bind(this);
        this.answerEdit = this.answerEdit.bind(this);
        this.addNewAnswer = this.addNewAnswer.bind(this);
        this.deleteAnswer = this.deleteAnswer.bind(this);
        this.saveTask = this.saveTask.bind(this);
        this.cancelCallback = this.cancelCallback.bind(this);
    }

    clickAnswer(id) {
        const { answers } = this.state;
        const newAnswers = [ ...answers ];
        for (let i in newAnswers) {
            if (newAnswers[i].id !== id) {
                continue;
            }
            newAnswers[i].correct = !newAnswers[i].correct;
            break;
        }
        this.setState({ answers: [ ...newAnswers] })
    }
    answerEdit(e, id) {
        const { answers } = this.state;
        const newAnswers = [ ...answers ];
        for (let i in newAnswers) {
            if (newAnswers[i].id !== id) {
                continue;
            }
            newAnswers[i].text = e.target.value;
            break;
        }
        this.setState({ answers: [ ...newAnswers] })
    }
    addNewAnswer() {
        const { answers } = this.state;

        let id = 0;
        if (answers.length === 0) {
            id = 1;
        } else {
            let max_id = 0;
            answers.map((a) => {
                if (a.id > max_id) {
                    max_id = a.id;
                }
            })
            id = max_id + 1;
        }
        this.setState(
            {
                answers: [
                    ...answers,
                    {
                        id: id,
                        text: '',
                        correct: false,
                    }
                ]
            }
        )
    }
    deleteAnswer(id) {
        const { answers } = this.state;
        this.setState(
            {
                answers: answers.filter((a) => a.id !== id)
            }
        );
    }

    saveTask() {
        const { saveCallback } = this.props;
        const { id, question, answers } = this.state;
        if (question.length === 0) {
            alert('Необходимо заполнить текст вопроса');
            return false
        }
        if (answers.filter((a) => a.correct).length === 0) {
            alert('Ни один из ответов не отмечен верным');
            return false
        }
        if (answers.filter((a) => a.text.length === 0).length > 0) {
            alert('Не все ответы заполнены');
            return false
        }
        saveCallback({ id: id, question: question, answers: [ ...answers ], type: 'simpleSelect' });
    }

    cancelCallback() {
        const { cancelCallback } = this.props;
        const { id } = this.state;
        cancelCallback({id: id});
    }

    render() {
        const { question, answers} = this.state;
        return <div className='simple-select-form'>
            <div className="simple-select-row question">
                <div>Вопрос:</div>
                <textarea value={question} onChange={(e) => this.setState({ question: e.target.value })}/>
            </div>
            <div className="simple-select-row answers">
                <div>Ответы:</div>
                <Button type="add" title="Добавить вариант ответа" onClick={this.addNewAnswer}/>
            </div>
            {answers.map((answer) =>
                <div className="simple-select-row answers" key={'answ-' + answer.id}>
                    <div></div>
                    <div>
                        <Checkbox
                            checked={answer.correct}
                            callback={() => {this.clickAnswer(answer.id);}}
                        />
                        <input
                            type="text"
                            value={answer.text}
                            onChange={(e) => {
                                this.answerEdit(e, answer.id)
                            }}
                        />
                        <Button type="delete" title="Удалить" onClick={() => {this.deleteAnswer(answer.id)}}/>
                    </div>
                </div>
            )}

            <Button type="save" title="Сохранить изменения" onClick={this.saveTask}/>
            <Button type="cancel" title="Не сохранять изменения" onClick={this.cancelCallback}/>
        </div>
    }
}
class SimpleSelectView extends React.Component {
    constructor(props) {
        super(props);

        this.state = { ...this.props.task }
        // this.clickAnswer = this.clickAnswer.bind(this);
    }

    render() {
        const { editClick, deleteClick } = this.props;
        const { id, question, answers } = this.state;
        return <div className='simple-select-view'>
            <div className="id-buttons">
                <div>#{id}</div>
                <Button type="edit" title="Редактировать" onClick={() => {editClick(id)}}/>
                <Button type="delete" title="Удалить" onClick={() => {deleteClick(id)}}/>
            </div>
            <div>
                <div className="question"><span>Вопрос:</span> {question}</div>
                <div className="answers">
                    <span>Количество ответов:</span> {answers.length},
                    <span>верных:</span> {answers.map((a) => a.correct ? 1 : 0).reduce((s, c) => s + c, 0)}
                </div>
            </div>
        </div>
    }
}

class SimpleAnswerEditor extends React.Component {
    constructor(props) {
        super(props);

        const content = 'content' in this.props ? this.props['content'] : {};

        this.state = {
            id: 'id' in content ? content['id'] : null,
            question: 'question' in content ? content['question'] : "",
            check_by_teacher: 'check_by_teacher' in content ? content['check_by_teacher'] : false,
            answers_variants: 'answers_variants' in content ? content['answers_variants'] : [],
        }
        this.saveTask = this.saveTask.bind(this);
        this.cancelCallback = this.cancelCallback.bind(this);
    }

    saveTask() {
        const { saveCallback } = this.props;
        const { id, question, check_by_teacher, answers_variants } = this.state;
        if (question.length === 0) {
            alert('Необходимо заполнить текст вопроса');
            return false
        }
        if (check_by_teacher) {
            saveCallback(
                {
                    id: id,
                    question: question,
                    check_by_teacher: check_by_teacher,
                    answers_variants: [],
                    type: 'simpleAnswer'
                }
            );
            return false;
        }

        if (answers_variants.filter((a) => a.length > 0).length === 0) {
            alert('Ни один из вариантов ответа не заполнен');
            return false;
        }
        if (answers_variants.filter((a) => a.length === 0).length > 0) {
            alert('Не все варианты ответа заполнены');
            return false;
        }
        saveCallback(
            {
                id: id,
                question: question,
                check_by_teacher: check_by_teacher,
                answers_variants: [ ...answers_variants ],
                type: 'simpleAnswer'
            }
        );
    }

    cancelCallback() {
        const { cancelCallback } = this.props;
        const { id } = this.state;
        cancelCallback({id: id});
    }

    render() {
        const { question, check_by_teacher, answers_variants} = this.state;
        return <div className='simple-answer-form'>
            <div className="simple-answer-row question">
                <div>Вопрос:</div>
                <textarea value={question} onChange={(e) => this.setState({ question: e.target.value })}/>
            </div>
            <div className="simple-answer-row check-by-teacher">
                <Checkbox checked={check_by_teacher} callback={() => { this.setState({ check_by_teacher: !check_by_teacher }); }}/>
                &nbsp;Ответ проверяется учителем
            </div>
            {!check_by_teacher &&
                <div className="simple-answer-row answers">
                    <div>Варианты ответа</div>
                    <Button
                        type="add"
                        title="Добавить вариант ответа"
                        onClick={() => {
                            answers_variants.push("");
                            this.setState({ answers_variants: [ ...answers_variants ] });
                        }}/>
                </div>
            }
            {!check_by_teacher &&
                answers_variants.map((a, i) => {
                    return <div className="simple-answer-row answers" key={'sara-' + i}>
                        <div>&nbsp;</div>
                        <div>
                            <input
                                type="text"
                                value={a}
                                onChange={(e) => {
                                    answers_variants[i] = e.target.value;
                                    this.setState({ answers_variants: [ ...answers_variants ] });
                                }}
                            />
                            <Button type="delete" title="Удалить" onClick={() => {
                                answers_variants.splice(i, 1);
                                this.setState({ answers_variants: [ ...answers_variants ] });
                            }}/>
                        </div>
                    </div>
                })

            }
            <Button type="save" title="Сохранить изменения" onClick={this.saveTask}/>
            <Button type="cancel" title="Не сохранять изменения" onClick={this.cancelCallback}/>
        </div>
    }
}
class SimpleAnswerView extends React.Component {
    constructor(props) {
        super(props);

        this.state = { ...this.props.task }
    }

    render() {
        const { editClick, deleteClick } = this.props;
        const { id, question, check_by_teacher, answers_variants } = this.state;
        return <div className='simple-select-view'>
            <div className="id-buttons">
                <div>#{id}</div>
                <Button type="edit" title="Редактировать" onClick={() => {editClick(id)}}/>
                <Button type="delete" title="Удалить" onClick={() => {deleteClick(id)}}/>
            </div>
            <div>
                <div className="question"><span>Вопрос:</span> {question}</div>
                <div className="answers">
                    <span>Проверка учителем:</span> {check_by_teacher ? "Да" : "Нет"},&nbsp;
                    {!check_by_teacher &&
                        <span>Количество вариантов ответа:</span>
                    }
                    {!check_by_teacher && answers_variants.length }
                </div>
            </div>
        </div>
    }
}
