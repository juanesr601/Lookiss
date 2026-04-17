import Sidebar from '../components/Sidebar.jsx';
import Avatar from '../components/Avatar.jsx';
import '../styles/messages.css';

const MOCK_CONVS = [
  { name:'María García',    last:'¡Hola! ¿Cómo estás?',        time:'2m',  unread:2 },
  { name:'Diego Martínez',  last:'Oye, viste el partido?',      time:'15m', unread:0 },
  { name:'Valentina López', last:'La receta quedó increíble!',  time:'1h',  unread:1 },
  { name:'Sofía Vargas',    last:'Gracias por el follow 😊',    time:'3h',  unread:0 },
];

export default function Messages() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area" style={{ justifyContent:'flex-start' }}>
        <div style={{ width:'100%', maxWidth:660 }}>
          <div className="card">
            <div className="messages-header">
              <h2 className="messages-title">Mensajes</h2>
            </div>

            <div className="messages-search">
              <input className="input-field" placeholder="Buscar conversación..." style={{ borderRadius:'var(--radius-full)' }} />
            </div>

            {MOCK_CONVS.map((c, i) => (
              <div key={i} className="conv-row">
                <div className="conv-avatar-wrap">
                  <Avatar name={c.name} size={44} fontSize={15} />
                  {c.unread > 0 && (
                    <div className="conv-unread-badge">{c.unread}</div>
                  )}
                </div>
                <div className="conv-info">
                  <div className="conv-top">
                    <span className={`conv-name ${c.unread ? 'unread' : ''}`}>{c.name}</span>
                    <span className="conv-time">{c.time}</span>
                  </div>
                  <p className="conv-last">{c.last}</p>
                </div>
              </div>
            ))}

            <div className="messages-coming-soon">
              💬 Los mensajes en tiempo real llegan pronto
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
