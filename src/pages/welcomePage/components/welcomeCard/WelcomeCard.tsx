import { FC } from 'react';

import './WelcomeCard.scss';

interface WelcomeCardProps {
  src: string;
  name: string;
  specialization: string;
  github: string;
  linkedin: string;
  instagram: string;
}

const WelcomeCard: FC<WelcomeCardProps> = ({
  src,
  name,
  specialization,
  github,
  linkedin,
  instagram,
}) => {
  return (
    <div className="welcome__card">
      <img className="card-img" src={src} alt="Avatar" />
      <div className="card__container">
        <h3 className="h3 card-info">{name}</h3>
        <h4 className="h4 card-info">{specialization}</h4>
        <ul className="card__list">
          <li className="card__list-item">
            <a
              href={github}
              target="_blank"
              rel="noreferrer noopener"
              className="card-link github"
            />
          </li>
          <li className="card__list-item">
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className="card-link linkedin"
            />
          </li>
          <li className="card__list-item">
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="card-link instagram"
            />
          </li>
        </ul>
      </div>
    </div>
  );
};

export { WelcomeCard };