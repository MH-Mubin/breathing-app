export default function Profile() {
  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="card bg-dark text-light p-8 mb-8">
        <h2 className="text-2xl font-bold mb-2">Profile Settings</h2>
        <p className="mb-6 text-gray-300">
          Manage your account and preferences
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6 flex flex-col items-center">
            <div className="rounded-full bg-primary w-20 h-20 center text-4xl mb-4">
              👤
            </div>
            <div className="font-semibold mb-1">Sarah Johnson</div>
            <div className="text-gray-400 text-sm mb-2">sarah.j@email.com</div>
            <div className="btn-primary px-3 py-1 text-xs mb-2">
              Premium Member
            </div>
            <div className="text-xs mb-1">
              Member Since <span className="font-bold">Jan 2024</span>
            </div>
            <div className="text-xs mb-1">
              Total Sessions <span className="font-bold">48</span>
            </div>
            <div className="text-xs mb-1">
              Current Streak <span className="font-bold">7 days</span>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Achievements</h4>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-primary rounded-full w-8 h-8 center text-xl"
                  >
                    🏆
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 mb-4">
              <h4 className="font-semibold mb-2">Personal Information</h4>
              <div className="mb-2 text-sm">
                Full Name: <span className="font-bold">Sarah Johnson</span>
              </div>
              <div className="mb-2 text-sm">
                Email Address:{" "}
                <span className="font-bold">sarah.j@email.com</span>
              </div>
              <div className="mb-2 text-sm">
                Phone Number:{" "}
                <span className="font-bold">+1 (555) 123-4567</span>
              </div>
              <div className="mb-2 text-sm">
                Location: <span className="font-bold">San Francisco, CA</span>
              </div>
              <button className="btn-outline px-3 py-1 mt-2">Edit</button>
            </div>
            <div className="card p-6 mb-4">
              <h4 className="font-semibold mb-2">Preferences</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span>Notifications</span>
                  <input type="checkbox" checked readOnly />
                </div>
                <div className="flex items-center justify-between">
                  <span>Daily Reminders</span>
                  <input type="checkbox" checked readOnly />
                </div>
                <div className="flex items-center justify-between">
                  <span>Achievement Alerts</span>
                  <input type="checkbox" readOnly />
                </div>
                <div className="flex items-center justify-between">
                  <span>Email Updates</span>
                  <input type="checkbox" checked readOnly />
                </div>
              </div>
            </div>
            <div className="card p-6 mb-4">
              <h4 className="font-semibold mb-2">Account & Security</h4>
              <div className="flex flex-col gap-2">
                <button className="btn-outline px-3 py-1">
                  Change Password
                </button>
                <button className="btn-outline px-3 py-1">
                  Privacy Settings
                </button>
                <button className="btn-outline px-3 py-1">
                  Help & Support
                </button>
                <button className="btn-primary px-3 py-1">Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
