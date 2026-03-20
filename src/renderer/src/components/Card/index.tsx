import './styles.module.css';

interface CardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: string;
}

const Card = ({
  title = 'Card Title',
  description = 'Descrição do card. Pode ser personalizada via props.',
  buttonText = 'Ação',
  onButtonClick = () => alert('Botão clicado!'),
  icon = '✨',
}: CardProps) => {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">{icon}</span>
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <button className="card-button" onClick={onButtonClick}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Card;