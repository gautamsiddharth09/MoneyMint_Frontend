import './PlaceholderPage.css'


function PlaceholderPage({ title, description, icon }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-page__icon">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="placeholder-page__badge">Coming soon</span>
    </section>
  )
}

export default PlaceholderPage
