import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';

const DemoRequestModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', organization: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const API_BASE_URL = '/api';
      const response = await fetch(`${API_BASE_URL}/demo-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setFormData({ name: '', email: '', organization: '' });
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <button className="modal-close" onClick={onClose}><X size={20} /></button>
            
            {status === 'success' ? (
              <div className="modal-success">
                <CheckCircle size={48} className="text-teal" />
                <h3>Request Received</h3>
                <p>A research coordinator will contact you shortly to schedule your behavioral simulation demo.</p>
              </div>
            ) : (
              <div className="modal-form-wrapper">
                <h2>Request Simulation Demo</h2>
                <p>Experience how LAI measures real behavior under strategic pressure.</p>
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Work Email</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@organization.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Organization</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.organization}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                      placeholder="Company Name"
                    />
                  </div>
                  
                  <button type="submit" className="btn-submit" disabled={status === 'loading'}>
                    {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Submit Request'}
                  </button>
                  
                  {status === 'error' && <p className="error-msg">Something went wrong. Please try again.</p>}
                </form>
              </div>
            )}
          </motion.div>

          <style jsx>{`
            .modal-overlay {
              position: fixed; top: 0; left: 0; width: 100%; height: 100%;
              background: rgba(10, 25, 47, 0.6);
              backdrop-filter: blur(4px);
              z-index: 2000;
            }
            .modal-content {
              position: fixed; top: 50%; left: 50%;
              transform: translate(-50%, -50%);
              width: 90%; max-width: 500px;
              background: white; border-radius: 12px;
              padding: 3rem; z-index: 2001;
              box-shadow: 0 30px 60px rgba(0,0,0,0.2);
            }
            .modal-close {
              position: absolute; top: 1.5rem; right: 1.5rem;
              background: none; border: none; cursor: pointer; color: var(--slate);
            }
            h2 { font-size: 2rem; color: var(--navy); margin-bottom: 0.5rem; }
            p { color: var(--text-muted); margin-bottom: 2rem; }
            .form-group { margin-bottom: 1.5rem; }
            label { display: block; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--slate-light); margin-bottom: 0.5rem; }
            input {
              width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border-color);
              border-radius: 4px; font-size: 1rem; outline: none; transition: border-color 0.2s;
            }
            input:focus { border-color: var(--teal); }
            .btn-submit {
              width: 100%; background: var(--navy); color: white; border: none;
              padding: 1rem; border-radius: 4px; font-weight: 700; cursor: pointer;
              display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            }
            .btn-submit:hover { background: var(--teal); }
            .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
            .modal-success { text-align: center; padding: 2rem 0; }
            .modal-success h3 { font-size: 1.5rem; margin: 1.5rem 0 0.5rem; }
            .error-msg { color: #e53e3e; font-size: 0.8rem; margin-top: 1rem; text-align: center; }
            .animate-spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
};

export default DemoRequestModal;
