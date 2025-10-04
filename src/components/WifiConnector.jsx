
import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import './WifiConnector.css';

const WifiConnector = () => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [networkFound, setNetworkFound] = useState(false);

  const mockApi = {
    scanForNetworks: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return ['OtherNet', 'SIGAIR', 'MyHomeWifi'];
    },
    connectToWifi: async (ssid, password) => {
      console.log(`Attempting to connect with SSID: ${ssid} and Password: "${password}"`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (ssid === 'SIGAIR' && password.trim().toLowerCase() === 'password') {
        return { success: true, message: 'Connected to SIGAIR' };
      } else {
        return { success: false, message: 'Incorrect password or network' };
      }
    },
    getIoTDeviceStatus: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [
        { id: 'Thermostat', status: 'Online', details: '22°C' },
        { id: 'Smart Lock', status: 'Online', details: 'Locked' },
        { id: 'Camera 1', status: 'Offline', details: 'Check power' },
        { id: 'Smart Lighting', status: 'Online', details: '75% Brightness' },
      ];
    },
  };

  const handleScan = async () => {
    setConnecting(true);
    const networks = await mockApi.scanForNetworks();
    setConnecting(false);
    setScanned(true);
    if (networks.includes('SIGAIR')) {
      setNetworkFound(true);
      setSsid('SIGAIR');
      toast.success('Network SIGAIR found!');
    } else {
      setNetworkFound(false);
      toast.error('Connection unavailable: SIGAIR network not found.');
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter the password.');
      return;
    }
    setConnecting(true);
    const result = await mockApi.connectToWifi(ssid, password);
    setConnecting(false);
    if (result.success) {
      setConnected(true);
      toast.success(result.message);
    } else {
      setConnected(false);
      toast.error(result.message);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setScanned(false);
    setSsid('');
    setPassword('');
    toast.success('Disconnected from the network.');
  };

  const [iotDevices, setIotDevices] = useState([]);

  React.useEffect(() => {
    if (connected) {
      mockApi.getIoTDeviceStatus().then(setIotDevices);
    }
  }, [connected]);

  return (
    <div className="wifi-connector-container">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="wifi-card">
        <div className="wifi-card-header">
          <h2>{connected ? 'IoT Devices' : 'WiFi Connection'}</h2>
          {connected && (
            <p className="wifi-ssid">
              Connected to <strong>{ssid}</strong>
            </p>
          )}
        </div>
        {!connected ? (
          <div>
            {!scanned ? (
              <button onClick={handleScan} className="connect-button" disabled={connecting}>
                {connecting ? 'Scanning...' : 'Scan for Networks'}
              </button>
            ) : networkFound ? (
              <form onSubmit={handleConnect} className="wifi-form">
                <div className="form-group">
                  <label htmlFor="password">Password for SIGAIR</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="show-password-button"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="connect-button" disabled={connecting}>
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              </form>
            ) : (
              <p>SIGAIR network not found. Please try scanning again.</p>
            )}
          </div>
        ) : (
          <div className="iot-device-list">
            {iotDevices.map((device) => (
              <div key={device.id} className={`iot-device ${device.status.toLowerCase()}`}>
                <div className="device-info">
                  <span className="device-name">{device.id}</span>
                  <span className="device-details">{device.details}</span>
                </div>
                <span className="device-status">{device.status}</span>
              </div>
            ))}
            <button onClick={handleDisconnect} className="disconnect-button">
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WifiConnector;
