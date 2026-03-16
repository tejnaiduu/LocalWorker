import '../shared/UIComponents.css';

function RatingStars({ rating, reviews }) {
  const stars = Array(5)
    .fill(0)
    .map((_, i) => i < Math.floor(rating) ? '⭐' : '☆');

  return (
    <div className="rating-stars">
      <span className="stars">{stars.join('')}</span>
      <span className="rating-number">{rating.toFixed(1)} / 5</span>
      {reviews !== undefined && <span className="reviews-count">({reviews} reviews)</span>}
    </div>
  );
}

export default RatingStars;
