const Button = ({ disabled = false, className, onClick, text }) => {

    return (
        <button className={className} onClick={onClick} disabled={disabled}>{text}</button>
    )

}

export default Button