const Button = ({ disabled = false, className, onClick, text, data }) => {

    return (
        <button className={className} onClick={onClick} disabled={disabled} data={data}>{text}</button>
    )

}

export default Button