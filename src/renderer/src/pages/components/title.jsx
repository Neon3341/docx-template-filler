const Title = (title) => {

    const style = {
        fontSize: title.fontSize,
        fontWeight: title.fontWeight
    };

    return (
        <span className="title" style={style}>{title.text}</span>
    )

}

export default Title