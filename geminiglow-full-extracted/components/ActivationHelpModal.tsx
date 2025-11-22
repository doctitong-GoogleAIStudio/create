import React from 'react';

interface ActivationHelpModalProps {
  onClose: () => void;
}

export const ActivationHelpModal: React.FC<ActivationHelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold text-[#3a3a3a] dark:text-gray-100 mb-6 text-center">How to Activate Your App</h2>

        <div className="space-y-4 text-left text-gray-700 dark:text-gray-300">
          <ol className="list-decimal list-inside space-y-3">
            <li>Copy the link of the app and paste at the address bar of Chrome Browser.</li>
            <li>An "Activation Message" will appear.</li>
            <li>Copy the "Installation ID" and "Public Key" and mail them to <a href="mailto:vicvicventures@gmail.com" className="text-[#c5a78f] hover:underline">vicvicventures@gmail.com</a>.</li>
            <li>Once we receive the details, we will send a Gcash QR code to your email.</li>
            <li>Scan the QR code with your Gcash app.</li>
            <li>Pay the amount of 1,500 pesos through Gcash.</li>
            <li>Screenshot the Gcash receipt and email it to <a href="mailto:vicvicventures@gmail.com" className="text-[#c5a78f] hover:underline">vicvicventures@gmail.com</a>.</li>
            <li>Once we verify the payment, we will send the "License Key" to your email.</li>
            <li>Copy and paste the "License Key" into the appropriate field and click "Activate".</li>
            <li>The app should now be unlocked for that specific device.</li>
            <li>This process ensures that each license is securely tied to the device that requested it.</li>
          </ol>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Important Notes (N.B.)</h3>
            <p className="mt-2 text-sm">If you've encountered an issue where a generated license was rejected, the most common reasons are:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>A small mistake in copying and pasting either the Installation ID or the Public Key.</li>
                <li>Trying to use a license on a different device than the one that generated the ID and Key.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full bg-[#c5a78f] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#b9987e] transition-all duration-300 text-lg shadow-md hover:shadow-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};
