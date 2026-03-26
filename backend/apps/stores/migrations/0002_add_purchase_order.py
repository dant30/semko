from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("stores", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Supplier",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150, unique=True)),
                ("contact_name", models.CharField(blank=True, max_length=150)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("phone", models.CharField(blank=True, max_length=40)),
                ("address", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["name"],
                "verbose_name": "Supplier",
                "verbose_name_plural": "Suppliers",
            },
        ),
        migrations.CreateModel(
            name="PurchaseOrder",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("reference_no", models.CharField(max_length=50, unique=True)),
                ("order_date", models.DateField()),
                ("expected_date", models.DateField(blank=True, null=True)),
                ("status", models.CharField(choices=[("draft", "Draft"), ("pending_approval", "Pending Approval"), ("approved", "Approved"), ("partially_received", "Partially Received"), ("closed", "Closed"), ("cancelled", "Cancelled")], default="draft", max_length=20)),
                ("notes", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
                ("supplier", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="purchase_orders", to="stores.supplier")),
            ],
            options={
                "ordering": ["-order_date", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="PurchaseOrderLine",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("ordered_quantity", models.DecimalField(decimal_places=2, max_digits=12)),
                ("received_quantity", models.DecimalField(default=0, decimal_places=2, max_digits=12)),
                ("unit_cost", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("item", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="po_lines", to="stores.item")),
                ("purchase_order", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lines", to="stores.purchaseorder")),
            ],
            options={
                "ordering": ["purchase_order", "item"],
                "unique_together": {("purchase_order", "item")},
            },
        ),
        migrations.AddField(
            model_name="stockreceiving",
            name="purchase_order",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="receivings", to="stores.purchaseorder"),
        ),
        migrations.AddField(
            model_name="stockreceiving",
            name="purchase_order_line",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="receivings", to="stores.purchaseorderline"),
        ),
    ]
