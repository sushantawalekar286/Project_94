export default function InventoryTable({ items = [] }) {
  return (
    <div className="table">
      {items.map((item) => (
        <div key={item._id} className="table-row">
          <span>{item.name}</span>
          <span>{item.stock}</span>
        </div>
      ))}
    </div>
  );
}
