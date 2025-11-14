"use client"
import { Plus, Copy, ArrowRight, ChevronLeft } from "lucide-react"
import "./Button.css"

const Button = ({ 
  children, 
  variant = "primary", 
  icon, 
  onClick, 
  disabled = false,
  type = "button",
  ...props 
}) => {
  
  const renderIcon = () => {
    switch(icon) {
      case 'plus':
        return <Plus size={18} />
      case 'copy':
        return <Copy size={18} />
      case 'arrow-right':
        return <ArrowRight size={18} />
      case 'chevron-left':
        return <ChevronLeft size={18} />
     default:
        return null
    }
  }

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${icon ? 'btn-with-icon' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {renderIcon()}
      {children}
    </button>
  )
}

export default Button