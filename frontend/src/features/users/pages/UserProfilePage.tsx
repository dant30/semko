import { useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { authApi } from "@/features/auth/services/auth.api";
import { updateUser } from "@/features/auth/store/auth.slice";
import { useNotifications } from "@/core/contexts/useNotifications";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";

export function UserProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { showToast } = useNotifications();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const updatedUser = await authApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
      });

      dispatch(updateUser(updatedUser));

      showToast({ title: "Profile updated", message: "Your profile has been updated.", tone: "success" });
    } catch {
      setError("Unable to update your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-shell">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg rounded-2xl p-8">
          <Badge>Profile</Badge>
          <h1 className="mt-4 text-2xl">Update your profile</h1>
          <p className="mt-2 text-sm text-app-secondary">Adjust your account information below.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="form-group">
              <span className="form-label">First name</span>
              <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
            </label>

            <label className="form-group">
              <span className="form-label">Last name</span>
              <Input value={lastName} onChange={(event) => setLastName(event.target.value)} required />
            </label>

            <label className="form-group">
              <span className="form-label">Email</span>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </label>

            <label className="form-group">
              <span className="form-label">Phone</span>
              <Input value={phoneNumber ?? ""} onChange={(event) => setPhoneNumber(event.target.value)} />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Update profile"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
