import { useState, useRef } from "react";

// ─── shadcn/ui imports ───────────────────────────────────────────────────────
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ─── Icons (lucide-react) ─────────────────────────────────────────────────────
import {
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: initials from full name
// ─────────────────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: FieldError
// ─────────────────────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Profile
// ─────────────────────────────────────────────────────────────────────────────
function ProfileTab() {
  const fileRef = useRef(null);

  const [name, setName] = useState("Alex Johnson");
  const [email, setEmail] = useState("alex@example.com");
  const [bio, setBio] = useState("Product designer & coffee enthusiast.");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address.";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast.success("Profile saved", {
      description: "Your profile has been updated successfully.",
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-4 h-4" /> Profile
        </CardTitle>
        <CardDescription>
          Update your name, email, and public profile photo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 text-base">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile photo" />}
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" /> Upload photo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              disabled={!avatarUrl}
              onClick={() => setAvatarUrl("")}
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <Separator />

        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="profileName">Full name</Label>
            <Input
              id="profileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className={errors.name ? "border-destructive" : ""}
            />
            <FieldError msg={errors.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profileEmail">Email address</Label>
            <Input
              id="profileEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={errors.email ? "border-destructive" : ""}
            />
            <FieldError msg={errors.email} />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label htmlFor="profileBio">
            Bio{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <textarea
            id="profileBio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell us a little about yourself"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {loading ? "Saving…" : "Save profile"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Account
// ─────────────────────────────────────────────────────────────────────────────
function AccountTab() {
  const [username, setUsername] = useState("alexj");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required.";
    if (newPw || confirmPw || currentPw) {
      if (!currentPw) e.currentPw = "Current password is required.";
      if (newPw && newPw.length < 8)
        e.newPw = "Password must be at least 8 characters.";
      if (newPw !== confirmPw) e.confirmPw = "Passwords do not match.";
    }
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast.success("Account updated", {
      description: "Your account settings have been saved.",
    });
  };

  const PwInput = ({ id, value, onChange, placeholder, showKey }) => (
    <div className="relative">
      <Input
        id={id}
        type={showPw[showKey] ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`pr-10 ${errors[showKey === "current" ? "currentPw" : showKey === "new" ? "newPw" : "confirmPw"] ? "border-destructive" : ""}`}
      />
      <button
        type="button"
        onClick={() => setShowPw((p) => ({ ...p, [showKey]: !p[showKey] }))}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={showPw[showKey] ? "Hide password" : "Show password"}
      >
        {showPw[showKey] ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-4 h-4" /> Account
        </CardTitle>
        <CardDescription>
          Manage your username, password, and security settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_username"
            className={errors.username ? "border-destructive" : ""}
          />
          <FieldError msg={errors.username} />
        </div>

        <Separator />

        {/* Password */}
        <div>
          <p className="text-sm font-medium mb-4">Change password</p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPw">Current password</Label>
              <PwInput
                id="currentPw"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                showKey="current"
              />
              <FieldError msg={errors.currentPw} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPw">New password</Label>
                <PwInput
                  id="newPw"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min. 8 characters"
                  showKey="new"
                />
                <FieldError msg={errors.newPw} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPw">Confirm password</Label>
                <PwInput
                  id="confirmPw"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  showKey="confirm"
                />
                <FieldError msg={errors.confirmPw} />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* 2FA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Two-factor authentication</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add an extra layer of security to your account.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {twoFactor && (
              <Badge variant="secondary" className="text-xs">
                Enabled
              </Badge>
            )}
            <Switch
              id="twoFactor"
              checked={twoFactor}
              onCheckedChange={(val) => {
                setTwoFactor(val);
                toast.message(val ? "2FA enabled" : "2FA disabled", {
                  description: val
                    ? "Two-factor authentication is now active."
                    : "Two-factor authentication has been turned off.",
                });
              }}
              aria-label="Two-factor authentication"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Notifications
// ─────────────────────────────────────────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const items = [
    {
      key: "email",
      label: "Email notifications",
      desc: "Receive updates and alerts via email.",
    },
    {
      key: "sms",
      label: "SMS notifications",
      desc: "Get text messages for critical alerts.",
    },
    {
      key: "push",
      label: "Push notifications",
      desc: "Browser and mobile push notifications.",
    },
    {
      key: "marketing",
      label: "Marketing emails",
      desc: "News, product updates, and promotions.",
    },
  ];

  const toggle = (key) => {
    const next = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: next }));
    const label = items.find((i) => i.key === key)?.label;
    toast.message(`${label} ${next ? "enabled" : "disabled"}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-4 h-4" /> Notifications
        </CardTitle>
        <CardDescription>
          Choose how and when you want to be notified.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div>
              <Label
                htmlFor={`notif-${item.key}`}
                className="text-sm font-medium cursor-pointer"
              >
                {item.label}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.desc}
              </p>
            </div>
            <Switch
              id={`notif-${item.key}`}
              checked={prefs[item.key]}
              onCheckedChange={() => toggle(item.key)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Appearance
// ─────────────────────────────────────────────────────────────────────────────
function AppearanceTab() {
  const [theme, setTheme] = useState("system");

  const themes = [
    {
      id: "light",
      label: "Light",
      desc: "Clean, bright interface.",
      icon: "☀️",
    },
    {
      id: "dark",
      label: "Dark",
      desc: "Easy on the eyes in low-light.",
      icon: "🌙",
    },
    {
      id: "system",
      label: "System default",
      desc: "Follows your OS preference.",
      icon: "💻",
    },
  ];

  const handleChange = (val) => {
    setTheme(val);
    toast.message(`Theme changed to ${val}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-4 h-4" /> Appearance
        </CardTitle>
        <CardDescription>
          Customize the look and feel of the interface.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium mb-3">Theme</p>
        <RadioGroup
          value={theme}
          onValueChange={handleChange}
          className="space-y-2"
        >
          {themes.map((t) => (
            <Label
              key={t.id}
              htmlFor={`theme-${t.id}`}
              className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors
                ${
                  theme === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/40"
                }`}
            >
              <RadioGroupItem value={t.id} id={`theme-${t.id}`} />
              <span className="text-lg leading-none" aria-hidden="true">
                {t.icon}
              </span>
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Privacy
// ─────────────────────────────────────────────────────────────────────────────
function PrivacyTab() {
  const [visibility, setVisibility] = useState("public");
  const [dataSharing, setDataSharing] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);

  const visibilityOptions = [
    {
      id: "public",
      label: "Public",
      desc: "Anyone can view your profile and activity.",
    },
    { id: "private", label: "Private", desc: "Only you can see your profile." },
  ];

  const handleVisibilityChange = (val) => {
    setVisibility(val);
    toast.message(`Profile set to ${val}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-4 h-4" /> Privacy
        </CardTitle>
        <CardDescription>
          Control your visibility and how your data is used.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visibility */}
        <div>
          <p className="text-sm font-medium mb-3">Profile visibility</p>
          <RadioGroup
            value={visibility}
            onValueChange={handleVisibilityChange}
            className="space-y-2"
          >
            {visibilityOptions.map((opt) => (
              <Label
                key={opt.id}
                htmlFor={`vis-${opt.id}`}
                className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors
                  ${
                    visibility === opt.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
              >
                <RadioGroupItem value={opt.id} id={`vis-${opt.id}`} />
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Toggles */}
        <div className="divide-y">
          {[
            {
              key: "dataSharing",
              val: dataSharing,
              set: setDataSharing,
              label: "Anonymous data sharing",
              desc: "Help improve the product with anonymous usage analytics.",
            },
            {
              key: "activityStatus",
              val: activityStatus,
              set: setActivityStatus,
              label: "Show activity status",
              desc: "Let others see when you were last active.",
            },
          ].map(({ key, val, set, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div>
                <Label
                  htmlFor={key}
                  className="text-sm font-medium cursor-pointer"
                >
                  {label}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <Switch
                id={key}
                checked={val}
                onCheckedChange={(next) => {
                  set(next);
                  toast.message(`${label} ${next ? "enabled" : "disabled"}`);
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root: SettingsPage
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const tabs = [
    {
      value: "profile",
      label: "Profile",
      icon: <User className="w-3.5 h-3.5" />,
    },
    {
      value: "account",
      label: "Account",
      icon: <Lock className="w-3.5 h-3.5" />,
    },
    {
      value: "notifications",
      label: "Notifications",
      icon: <Bell className="w-3.5 h-3.5" />,
    },
    {
      value: "appearance",
      label: "Appearance",
      icon: <Palette className="w-3.5 h-3.5" />,
    },
    {
      value: "privacy",
      label: "Privacy",
      icon: <Shield className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/40 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account preferences, privacy, and notifications.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6 w-full">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                {t.icon}
                <span>{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="account">
            <AccountTab />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceTab />
          </TabsContent>
          <TabsContent value="privacy">
            <PrivacyTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
