const Button = (button) => {

    return (
        <button className={button.className} onClick={button.onClick}>{button.text}</button>
    )

}

export default Button