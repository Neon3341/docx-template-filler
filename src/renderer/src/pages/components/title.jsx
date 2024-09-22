const Title = (title) => {

    const style = {
        fontSize: title.fontSize,
        fontWeight: title.fontWeight
    };

    return (
        <h3 className="title" style={style}>{title.text}</h3>
    )

}

export default Title