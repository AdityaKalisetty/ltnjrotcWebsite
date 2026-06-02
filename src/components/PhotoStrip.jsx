function PhotoStrip({ photos, onClickTile }) {
  return (
    <div className="photo-strip">
      {photos.map((photo, idx) => (
        <button
          key={`${photo.src}-${photo.name}-${idx}`}
          type="button"
          className="photo-tile"
          style={{ backgroundImage: `url(${photo.src})` }}
          aria-label={photo.name}
          onClick={() => onClickTile && onClickTile(photo, idx)}
        />
      ))}
    </div>
  );
}

export default PhotoStrip;
